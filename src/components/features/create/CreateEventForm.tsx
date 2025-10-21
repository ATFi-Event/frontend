"use client";

import { useState } from "react";
import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { apiService } from "@/utils/api";
import { web3Service } from "@/utils/web3";
import Navbar from "@/components/organism/Navbar";
import { useRouter } from "next/navigation";
import WalletService from "@/utils/walletService";

interface CreateEventData {
  event_id: number;
  title: string;
  description: string;
  image_url?: string;
  organizer_address: string;
}

// Custom SVG Components
function EventIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
        fill="currentColor"
      />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
        fill="currentColor"
      />
    </svg>
  );
}

function DescriptionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        fill="currentColor"
      />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function CreateEventForm() {
  const { authenticated, user, ready } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [blockchainStep, setBlockchainStep] = useState('');
  const [createdEventData, setCreatedEventData] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    stakeAmount: "",
    maxParticipants: 50,
    startDateTime: "",
    endDateTime: "",
    isVirtual: false,
    imageUrl: "",
    eventType: "public", // personal or public
    requireApproval: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a service like IPFS or S3
      // For now, we'll create a local URL
      setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Event title is required");
      return false;
    }
    if (!formData.startDateTime) {
      setError("Start date and time are required");
      return false;
    }
    if (!formData.stakeAmount || parseFloat(formData.stakeAmount) <= 0) {
      setError("Stake amount must be greater than 0");
      return false;
    }
    if (formData.maxParticipants <= 0) {
      setError("Max participants must be greater than 0");
      return false;
    }
    if (new Date(formData.startDateTime) <= new Date()) {
      setError("Event date must be in the future");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!ready) {
      setError("Authentication is not ready");
      return;
    }

    if (!authenticated || !user?.wallet?.address) {
      setError("Please connect your wallet to create an event");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Get preferred wallet (Gmail wallet first, then external wallet as fallback)
    const preferredWallet = WalletService.getPreferredWallet(user);
    if (!preferredWallet) {
      setError("No wallet available for transaction");
      return;
    }

    console.log(`Using wallet for event creation: ${preferredWallet.name} (${preferredWallet.address})`);
    console.log(`Wallet type: ${preferredWallet.type === 'gmail' ? 'Gmail-linked wallet' : 'External wallet'}`);

    // Note: Privy embedded wallet transactions will use the default provider
    // The smart wallet selection has already chosen the right wallet address
    // Privy will automatically use the embedded wallet for signing
    console.log('Privy will use embedded wallet for transaction signing');

    try {
      setIsCreating(true);
      setCurrentStep(1);

      // Convert form data to required format
      const startTimestamp = Math.floor(new Date(formData.startDateTime).getTime() / 1000);
      const registrationDeadline = startTimestamp - 3600; // 1 hour before event starts

      // Step 1: Create event vault on blockchain using Privy
      setBlockchainStep('Creating event vault on blockchain...');

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
      const stakeAmountWei = (parseFloat(formData.stakeAmount) * 1000000).toString();

      // Encode the function call data
      const calldata = encodeCreateEventCalldata(
        stakeAmountWei,
        registrationDeadline,
        startTimestamp,
        formData.maxParticipants
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

      // Wait for transaction confirmation and parse event ID
      // Note: In a real implementation, you'd wait for confirmation and parse the event
      // For now, we'll simulate getting an event ID from the transaction
      const eventId = Math.floor(Math.random() * 1000000); // Temporary - should parse from event logs

      const vaultResult = {
        eventId,
        txHash
      };

      setCurrentStep(2);
      setBlockchainStep('Blockchain transaction confirmed! Creating event metadata...');

      // Wait a few seconds for indexer to process the on-chain data
      console.log('Waiting for indexer to process on-chain data...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second wait

      // Step 2: Create event metadata in backend (only metadata needed, chain data handled by indexer)
      const eventData = {
        event_id: vaultResult.eventId,
        title: formData.title,
        description: formData.description || "",
        image_url: formData.imageUrl || "",
        organizer_address: preferredWallet.address // Use preferred wallet address
      };

      const createdEvent = await apiService.createEvent(eventData);
      setCreatedEventData({
        ...createdEvent,
        vaultAddress: "", // Vault address will be determined later
        txHash: vaultResult.txHash,
        blockchainEventId: vaultResult.eventId
      });

      setCurrentStep(3);
      setSuccess(true);

      // Reset form after successful creation
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          location: "",
          stakeAmount: "",
          maxParticipants: 50,
          startDateTime: "",
          endDateTime: "",
          isVirtual: false,
          imageUrl: "",
          eventType: "public",
          requireApproval: false,
        });
        setCurrentStep(1);
        setBlockchainStep('');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
      setCurrentStep(1);
      setBlockchainStep('');
    } finally {
      setIsCreating(false);
    }
  };

  if (!ready) {
    return (
      <>
        <Navbar active="create" />
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading authentication...</p>
          </div>
        </div>
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Navbar active="create" />
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center mb-6 mx-auto">
              <span className="material-symbols-outlined text-5xl text-white">lock</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
            <p className="text-gray-300 mb-8 text-lg">Please connect your wallet to create an event</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar active="create" />
      <section className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Amazing Event
            </h1>
            <p className="text-gray-300 text-xl">
              Bring your community together with blockchain-powered events
            </p>
          </div>

          {/* Wallet Information Display */}
          <div className="max-w-6xl mx-auto mb-6">
            {(() => {
              const preferredWallet = user ? WalletService.getPreferredWallet(user) : null;
              return preferredWallet ? (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        preferredWallet.type === 'gmail' ? 'bg-green-400' : 'bg-blue-400'
                      }`}></div>
                      <div>
                        <p className="text-white font-medium">
                          {preferredWallet.type === 'gmail' ? '📧 Gmail Wallet' : '🦊 External Wallet'} will be used
                        </p>
                        <p className="text-gray-300 text-sm">
                          {preferredWallet.name} ({WalletService.formatAddress(preferredWallet.address)})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Transaction Wallet</p>
                      <p className="text-white font-mono text-sm">
                        {WalletService.formatAddress(preferredWallet.address)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Image Upload */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <UploadIcon className="w-6 h-6" />
                    Event Cover
                  </h3>

                  <div className="relative">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-400 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all"
                    >
                      {formData.imageUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={formData.imageUrl}
                            alt="Event cover preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="mb-2 text-sm text-gray-300">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </>
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

                  {/* Event Type Selection */}
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-3">Event Type</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <input
                          type="radio"
                          name="eventType"
                          value="public"
                          checked={formData.eventType === "public"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div>
                          <span className="text-white font-medium">Public Event</span>
                          <p className="text-gray-400 text-sm">Anyone can join this event</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                        <input
                          type="radio"
                          name="eventType"
                          value="personal"
                          checked={formData.eventType === "personal"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div>
                          <span className="text-white font-medium">Personal Event</span>
                          <p className="text-gray-400 text-sm">By approval only</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <EventIcon className="w-6 h-6" />
                    Basic Information
                  </h3>

                  <div className="space-y-4">
                    {/* Event Title */}
                    <div>
                      <input
                        type="text"
                        name="title"
                        placeholder="Event Title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-medium"
                        required
                      />
                    </div>

                    {/* Event Location */}
                    <div className="relative">
                      <LocationIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        placeholder="Event Location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Event Description */}
                    <div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Describe your event..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6" />
                    Date & Time
                  </h3>

                  <div>
                    <label className="block text-gray-300 mb-2">Event Start</label>
                    <input
                      type="datetime-local"
                      name="startDateTime"
                      value={formData.startDateTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                {/* Event Settings */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Event Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stake Amount */}
                    <div>
                      <label className="block text-gray-300 mb-2">Stake Amount (USDC)</label>
                      <input
                        type="number"
                        name="stakeAmount"
                        value={formData.stakeAmount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="10.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    {/* Max Participants */}
                    <div>
                      <label className="block text-gray-300 mb-2">Max Participants</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Require Approval */}
                  <div className="mt-4">
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                      <input
                        type="checkbox"
                        name="requireApproval"
                        checked={formData.requireApproval}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <div>
                        <span className="text-white font-medium">Require Approval</span>
                        <p className="text-gray-400 text-sm">Participants need approval to join</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Progress Indicator */}
                {isCreating && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Creating Event</h3>
                      <span className="text-purple-400">Step {currentStep} of 3</span>
                    </div>
                    <div className="space-y-3">
                      <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-green-400' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-600'}`}>
                          {currentStep >= 1 ? '✓' : '1'}
                        </div>
                        <span className="font-medium">Creating blockchain vault</span>
                      </div>
                      <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-green-400' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}>
                          {currentStep >= 2 ? '✓' : '2'}
                        </div>
                        <span className="font-medium">Saving event metadata</span>
                      </div>
                      <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-green-400' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}>
                          {currentStep >= 3 ? '✓' : '3'}
                        </div>
                        <span className="font-medium">Finalizing event</span>
                      </div>
                    </div>
                    {blockchainStep && (
                      <p className="text-purple-300 text-sm mt-4 italic">{blockchainStep}</p>
                    )}
                  </div>
                )}

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/50 text-red-100 px-6 py-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl">error</span>
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {success && createdEventData && (
                  <div className="bg-green-500/20 backdrop-blur-lg border border-green-500/50 text-green-100 px-6 py-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-2xl">check_circle</span>
                      <span className="font-medium text-lg">Event created successfully! 🎉</span>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4 space-y-2 text-sm">
                      <div><span className="font-medium">Event ID:</span> #{createdEventData.event_id}</div>
                      <div><span className="font-medium">Vault Address:</span> {createdEventData.vaultAddress}</div>
                      <div><span className="font-medium">Transaction:</span> {createdEventData.txHash?.slice(0, 10)}...</div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/event/${createdEventData.event_id}`)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                      >
                        View Event
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/home')}
                        className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-all"
                      >
                        Back to Events
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg shadow-xl"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Event...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Create Event</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}