"use client";

import Image from "next/image";
import CounterNumber from "./CounterNumber";
import { useState, useEffect } from "react";
import Navbar from "@/components/organism/Navbar";
import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { handleMouseMove } from "@/utils/handleInput";
import CopyButton from "@/components/ui/CopyButton";
import WalletService from "@/utils/walletService";

const MAX_SHIFT = 15;

const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const todayFormatted = formatDateTimeLocal(new Date());

export default function CreateForm() {
  const { authenticated, user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [eventId, setEventId] = useState<number | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stakeAmount, setStakeAmount] = useState("1"); // Default 1 USDC
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Initialize dates
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week

    const registrationDeadlineFormatted = formatDateTimeLocal(tomorrow);
    const eventDateFormatted = formatDateTimeLocal(nextWeek);

    setRegistrationDeadline(registrationDeadlineFormatted);
    setEventDate(eventDateFormatted);
  }, []);

  // Mouse tracking for interactive background
  useEffect(() => {
    const listener = (event: MouseEvent) =>
      handleMouseMove(event, setPosition, MAX_SHIFT);

    window.addEventListener("mousemove", listener);
    return () => {
      window.removeEventListener("mousemove", listener);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const fileUrl = URL.createObjectURL(file);
      setImagePreviewUrl(fileUrl);

      // For now, just store a placeholder URL
      // In a real app, you'd upload this to a service
      setImageUrl(`/api/placeholder-image/${file.name}`);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  // Handler functions for form inputs
  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleRegistrationDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationDeadline(e.target.value);
  };

  const handleEventDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventDate(e.target.value);
  };

  const handleCapacityChange = (capacity: number) => {
    setMaxParticipants(capacity);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated) {
      setError("Please connect your wallet first");
      return;
    }

    if (!title.trim()) {
      setError("Event title is required");
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError("Stake amount must be greater than 0");
      return;
    }

    if (!registrationDeadline || !eventDate) {
      setError("Event dates are required");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Import services
      const { Web3Service } = await import('@/utils/web3');
      const { createEventMetadata } = await import('@/utils/api/events');

      // Convert dates to timestamps (in seconds)
      const registrationDeadlineTimestamp = Math.floor(new Date(registrationDeadline).getTime() / 1000);
      const eventDateTimestamp = Math.floor(new Date(eventDate).getTime() / 1000);

      // Validate dates
      const now = Math.floor(Date.now() / 1000);
      if (registrationDeadlineTimestamp <= now) {
        throw new Error("Registration deadline must be in the future");
      }
      if (eventDateTimestamp <= registrationDeadlineTimestamp) {
        throw new Error("Event date must be after registration deadline");
      }

      // Get preferred wallet (Gmail wallet first, then external wallet as fallback)
      if (!user) {
        throw new Error("User not authenticated");
      }
      const preferredWallet = WalletService.getPreferredWallet(user);
      if (!preferredWallet) {
        throw new Error("No wallet available for transaction");
      }

      console.log(`Using wallet for event creation: ${preferredWallet.name} (${preferredWallet.address})`);
      console.log(`Wallet type: ${preferredWallet.type === 'gmail' ? 'Gmail-linked wallet' : 'External wallet'}`);

      // Step 1: Create event vault on blockchain using Privy
      // Import the contract utilities to get calldata
      const { encodeCreateEventCalldata } = await import('@/utils/contracts/abi');
      const factoryConfig = await import('@/utils/contracts/factory');
      const CURRENT_NETWORK = factoryConfig.CURRENT_NETWORK;
      const CONTRACT_ADDRESSES = factoryConfig.CONTRACT_ADDRESSES;

      // Validate network configuration
      if (!CONTRACT_ADDRESSES[CURRENT_NETWORK] || !CONTRACT_ADDRESSES[CURRENT_NETWORK].FACTORY_ATFI) {
        throw new Error(`Factory ATFi contract not configured for network ${CURRENT_NETWORK}`);
      }

      // Convert stake amount to USDC smallest unit (6 decimals)
      const stakeAmountWei = (parseFloat(stakeAmount) * 1000000).toString();

      // Encode the function call data
      const calldata = encodeCreateEventCalldata(
        stakeAmountWei,
        registrationDeadlineTimestamp,
        eventDateTimestamp,
        maxParticipants
      );

      // Get factory contract address
      const factoryAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].FACTORY_ATFI;

      // Send transaction using Privy's embedded wallet
      const txHash = await sendTransaction(
        {
          to: factoryAddress,
          data: calldata,
        },
        {
          address: preferredWallet.address // Use the preferred wallet for signing
        }
      );

      console.log('Transaction sent with hash:', txHash);

      // Wait for transaction confirmation and get event ID from transaction result
      console.log("Waiting for transaction confirmation...");

      // Import utilities to parse transaction receipt
      // Use public RPC provider for all cases since we're only doing read operations
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

      let eventId: number | undefined;
      let maxRetries = 30; // Retry for up to 30 seconds

      while (maxRetries > 0) {
        try {
          // Get transaction receipt
          const receipt = await provider.getTransactionReceipt(txHash.hash);

          if (receipt && receipt.status === 1) {
            console.log("Transaction confirmed, getting event ID from transaction result...");

            // Get the transaction to access the return value
            const transaction = await provider.getTransaction(txHash.hash);
            if (transaction) {
              // For contract creation/function calls, we need to decode the return value
              // The createEvent function returns the eventId as uint256

              // Create a call to the factory to get the latest event ID
              const factoryConfig = await import('@/utils/contracts/factory');
              const CURRENT_NETWORK = factoryConfig.CURRENT_NETWORK;
              const CONTRACT_ADDRESSES = factoryConfig.CONTRACT_ADDRESSES;
              const factoryAddress = CONTRACT_ADDRESSES[CURRENT_NETWORK].FACTORY_ATFI;

              // Call the view function to get the current eventIdCounter (which would be the latest event ID + 1)
              const { ethers } = await import('ethers');
              const factoryAbi = [
                "function eventIdCounter() view returns (uint256)"
              ];
              const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);

              const currentCounter = await factoryContract.eventIdCounter();
              eventId = Number(currentCounter) - 1; // The latest event ID is counter - 1

              console.log("Retrieved event ID from factory counter:", eventId);
            }

            if (eventId) {
              break; // Found the event ID, exit the loop
            } else {
              throw new Error("Could not retrieve event ID from transaction result");
            }
          } else if (receipt && receipt.status === 0) {
            throw new Error("Transaction failed");
          }

          // Transaction not found yet, wait and retry
          console.log("Transaction not yet confirmed, retrying in 1 second...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          maxRetries--;

        } catch (error) {
          if (maxRetries <= 0) {
            throw new Error(`Failed to get transaction receipt after 30 seconds: ${error}`);
          }
          console.log("Error getting transaction receipt, retrying...", error);
          await new Promise(resolve => setTimeout(resolve, 1000));
          maxRetries--;
        }
      }

      if (!eventId) {
        throw new Error("Failed to retrieve event ID from transaction");
      }

      const contractResult = {
        eventId,
        txHash
      };

      console.log("Step 1: Contract call completed, event ID:", contractResult.eventId);
      setEventId(contractResult.eventId);

      // Wait for indexer to process the on-chain data
      console.log("Waiting for indexer to process on-chain data...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second wait

      // Step 2: Create event metadata in backend with the event_id
      try {
        const metadataData = {
          event_id: contractResult.eventId,
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl || undefined,
          organizer_address: user?.wallet?.address || "",
        };

        console.log("Step 2: Creating backend metadata with event_id:", contractResult.eventId);
        console.log("Step 2: Metadata payload:", metadataData);
        console.log("Step 2: Transaction hash:", contractResult.txHash);

        const { apiService } = await import('@/utils/api');
        const eventDetail = await apiService.createEvent(metadataData);
        console.log("Step 2: Event metadata created successfully:", eventDetail);
      } catch (metadataError) {
        console.error("Backend metadata creation failed:", metadataError);
        throw new Error(`Failed to create event metadata: ${metadataError instanceof Error ? metadataError.message : 'Unknown error'}`);
      }

      setSuccess(true);
      setEventId(contractResult.eventId);

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = `/event/manage/${contractResult.eventId}`;
      }, 2000);

    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-[#131517] relative overflow-hidden">
        {/* Animated Background */}
        <div
          className="absolute top-0 left-0 w-full h-full light-orb z-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse-slow"></div>
          <div className="absolute w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl bottom-20 right-10 animate-pulse-slow delay-500"></div>
        </div>

        <div className="relative z-10">
          {/* NAVBAR */}
          <Navbar active="none" create={true} />
          {/* END NAVBAR */}

          {/* Error and Success Messages */}
          <div className="relative z-10">
            {error && (
              <div className="max-w-4xl mx-auto mb-4">
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  <p className="font-medium">Error: {error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="max-w-4xl mx-auto mb-4">
                <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
                  <p className="font-medium">Event created successfully! 🎉</p>
                  <p className="text-sm">Event ID: {eventId}</p>
                  <p className="text-xs">Redirecting to management page...</p>
                </div>
              </div>
            )}

            {/* MAIN FORM */}
            <main className="mt-10 mx-auto max-w-4xl px-4">
              <form onSubmit={handleCreateEvent} className="space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-base text-white mb-2">CREATE EVENT</h1>
                </div>

                {/* Header with Image Upload */}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Image Upload */}
                  <div className="lg:w-1/3">
                    <label
                      htmlFor="dropzone-file"
                      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all
                ${
                  imagePreviewUrl
                    ? "border-transparent bg-white/5 backdrop-blur-lg border-white/10"
                    : "border-white/20 bg-white/5 backdrop-blur-lg hover:bg-white/10 hover:border-white/30"
                }`}
                    >
                      {imagePreviewUrl ? (
                        <Image
                          src={imagePreviewUrl}
                          alt="Preview Event Image"
                          width={300}
                          height={300}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                          <svg
                            className="w-10 h-10 mb-3 text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {/* Event Title and Basic Info */}
                  <div className="lg:w-2/3 space-y-6">
                    <div>
                      <input
                        type="text"
                        placeholder="Event Title"
                        value={title}
                        onChange={handleTitle}
                        className="w-full text-3xl font-bold bg-transparent border-0 border-b-2 border-gray-600 rounded-none focus:ring-0 focus:border-white text-white placeholder-gray-400 pb-2"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Registration Deadline */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Registration Deadline
                        </label>
                        <input
                          type="datetime-local"
                          value={registrationDeadline}
                          onChange={handleRegistrationDeadlineChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={todayFormatted}
                          required
                        />
                      </div>

                      {/* Event Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Event Date
                        </label>
                        <input
                          type="datetime-local"
                          value={eventDate}
                          onChange={handleEventDateChange}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={todayFormatted}
                          required
                        />
                      </div>
                    </div>

                    {/* Wallet Address Display */}
                    {authenticated && user?.wallet?.address && (
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Organizer Wallet:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono text-sm">
                              {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                            </span>
                            <CopyButton textToCopy={user.wallet.address} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Event Description
                  </label>
                  <textarea
                    value={description}
                    onChange={handleDescription}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe your event..."
                  />
                </div>

                {/* Event Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stake Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Stake Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Amount participants must stake to join</p>
                  </div>

                  {/* Max Participants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Maximum Participants
                    </label>
                    <div className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                      <CounterNumber onCapacityChange={handleCapacityChange} />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={`w-full font-semibold rounded-lg text-base px-6 py-3 text-center inline-flex items-center justify-center transition-all ${
                      isCreating
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "text-gray-900 bg-white hover:bg-gray-100 transform hover:scale-[1.02]"
                    }`}
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Event...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </button>
                </div>
              </form>
            </main>
            {/* END - MAIN FORM */}
          </div>
        </div>
      </section>
    </>
  );
}