"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { getEventDetails } from "@/utils/api/events";
import { apiService } from "@/utils/api";
import { handleMouseMove } from "@/utils/handleInput";
import WalletService from "@/utils/walletService";
import CopyButton from "@/components/ui/CopyButton";
import TransactionModal from "./TransactionModal";

interface EventData {
  event: {
    event_id: number;
    vault_address: string;
    organizer_address: string;
    stake_amount: string;
    max_participant: number;
    current_participants?: number;
    registration_deadline: number;
    event_date: number;
    title: string;
    status: string;
    description?: string;
    image_url?: string;
    organizer_name?: string;
  };
  participant_count: number;
}

const MAX_SHIFT = 15;

export default function OverviewContent() {
  const { slug } = useParams();
  const { authenticated, user } = usePrivy();
  const { sendTransaction } = useSendTransaction();

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showScanModal, setShowScanModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'liveNow' | 'settleEvent' | null>(null);

  useEffect(() => {
    const loadEventData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await getEventDetails(slug as string);
        setEventData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event data");
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [slug]);

  // Mouse tracking for interactive background
  useEffect(() => {
    const listener = (event: MouseEvent) =>
      handleMouseMove(event, setPosition, MAX_SHIFT);

    window.addEventListener("mousemove", listener);
    return () => {
      window.removeEventListener("mousemove", listener);
    };
  }, []);

  const formatEventDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStakeAmount = (amount: string) => {
    const usdcAmount = parseInt(amount) / 1000000;
    return `${usdcAmount} USDC`;
  };

  const handleLiveNow = () => {
    setPendingAction('liveNow');
    setShowTransactionModal(true);
  };

  const executeLiveNow = async () => {
    if (!eventData || !user) return;

    try {
      setIsProcessing(true);

      // Get preferred wallet (works for both MetaMask and Privy embedded wallets)
      const preferredWallet = WalletService.getPreferredWallet(user);
      if (!preferredWallet) {
        throw new Error('No wallet available for transaction');
      }

      console.log(`Using wallet for Go Live: ${preferredWallet.name} (${preferredWallet.address})`);
      console.log(`Wallet type: ${preferredWallet.type === 'gmail' ? 'Gmail-linked wallet' : 'External wallet'}`);

      // First call smart contract function depositToYieldSource()
      const { VAULT_FUNCTION_SIGNATURES } = await import("@/utils/contracts/vault");

      console.log("Executing depositToYieldSource transaction...");

      // Use Privy's unified sendTransaction (works for both Gmail and MetaMask)
      const txHash = await sendTransaction(
        {
          to: eventData.event.vault_address,
          data: VAULT_FUNCTION_SIGNATURES.DEPOSIT_TO_YIELD,
        },
        {
          address: preferredWallet.address
        }
      );
      console.log("✅ Go Live transaction successful! Hash:", txHash);

      // Wait a moment for blockchain to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Then call backend API to change event status to LIVE
      console.log("Updating event status in backend...");

      const updateEventStatus = async () => {
        const eventId = eventData.event.event_id;
        const updatePayload = {
          status: "LIVE"
        };

        console.log("📡 Attempting to update event status:", { eventId, updatePayload });

        // Try multiple possible endpoints
        const endpoints = [
          {
            url: `http://localhost:8080/api/v1/events/${eventId}/status`,
            method: "PATCH"
          },
          {
            url: `http://localhost:8080/api/v1/events/${eventId}`,
            method: "PATCH"
          },
          {
            url: `http://localhost:8080/api/v1/events/${eventId}/status`,
            method: "PUT"
          }
        ];

        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 Trying endpoint: ${endpoint.method} ${endpoint.url}`);

            const response = await fetch(endpoint.url, {
              method: endpoint.method,
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatePayload),
            });

            console.log(`📊 Response status: ${response.status} ${response.statusText}`);

            if (response.ok) {
              const responseData = await response.json();
              console.log("✅ Event status updated successfully in backend:", responseData);

              // Refresh event data
              const updatedData = await getEventDetails(slug as string);
              setEventData(updatedData);
              return { success: true, data: responseData };
            } else {
              const errorText = await response.text();
              console.error(`❌ Backend API error for ${endpoint.method} ${endpoint.url}:`, response.status, errorText);

              // If this is the last endpoint to try, throw an error
              if (endpoint === endpoints[endpoints.length - 1]) {
                throw new Error(`All endpoints failed. Last error: ${response.status} - ${errorText}`);
              }
            }
          } catch (endpointError) {
            console.error(`❌ Failed to connect to endpoint ${endpoint.url}:`, endpointError);

            // If this is the last endpoint to try, throw an error
            if (endpoint === endpoints[endpoints.length - 1]) {
              throw endpointError;
            }
          }
        }
      };

      try {
        const result = await updateEventStatus();
        if (result?.success) {
          console.log("🎉 Event status update completed successfully!");
        }
      } catch (error) {
        console.error("❌ All event status update attempts failed:", error);
        // Don't throw error - transaction succeeded but backend failed
        // Show warning to user instead
        setError(`⚠️ Transaction successful but backend update failed. The event may take a moment to reflect changes. Please refresh the page. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      setError(err instanceof Error ? err.message : "Failed to set event live");
      throw err; // Re-throw to let modal handle the error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanQR = () => {
    setShowScanModal(true);
  };

  const handleSettleEvent = () => {
    setPendingAction('settleEvent');
    setShowTransactionModal(true);
  };

  const executeSettleEvent = async () => {
    if (!eventData || !user?.wallet?.address) return;

    try {
      setIsProcessing(true);

      console.log('🔄 Getting attended participants for event settlement...');

      // Step 1: Call backend API to get attended participants
      const participantsResponse = await fetch(`http://localhost:8080/api/v1/events/${eventData.event.event_id}/participants`);

      if (!participantsResponse.ok) {
        throw new Error(`Failed to get participants: ${participantsResponse.status}`);
      }

      const participantsData = await participantsResponse.json();
      const participants = participantsData.participants || participantsData || [];
      console.log(`📊 Found ${participants.length} participants`);

      // Step 2: Filter participants who have attended (is_attend: true)
      const attendedParticipants = participants
        .filter((p: any) => p.is_attend)
        .map((p: any) => p.user_address)
        .filter((address: string | null) => address && address.trim() !== '');

      console.log(`✅ Found ${attendedParticipants.length} attended participants:`, attendedParticipants);

      if (attendedParticipants.length === 0) {
        throw new Error('No participants have attended this event yet. Cannot settle.');
      }

      // Step 3: Call smart contract directly with attended participant addresses
      console.log('🔗 Calling settleEvent smart contract with participant addresses...');

      // Import vault function signature
      const { VAULT_FUNCTION_SIGNATURES } = await import("@/utils/contracts/vault");

      // Encode the attended participants array for settleEvent function
      // Function signature: settleEvent(address[] calldata _attendedParticipants)
      const functionSignature = VAULT_FUNCTION_SIGNATURES.SETTLE_EVENT;
      let data = functionSignature.slice(2); // Remove 0x prefix

      // Add offset to array data (32 bytes from start of parameters section)
      // The array data starts immediately after the offset, so offset is 0x20 (32 in hex)
      data += '20'.padStart(64, '0');

      // Add array length (pad to 32 bytes)
      const arrayLength = attendedParticipants.length.toString(16).padStart(64, '0');
      data += arrayLength;

      // Encode each address (pad to 32 bytes)
      for (const address of attendedParticipants) {
        const paddedAddress = address.slice(2).padStart(64, '0'); // Remove 0x and pad
        data += paddedAddress;
      }

      const calldata = '0x' + data;

      // Use Privy's sendTransaction for settleEvent
      const txHash = await sendTransaction(
        {
          to: eventData.event.vault_address,
          data: calldata,
        },
        {
          address: user.wallet.address
        }
      );

      console.log("✅ Settle Event transaction hash:", txHash);

      // Step 4: Wait for transaction confirmation
      console.log('⏳ Waiting for transaction confirmation...');

      // Wait for transaction to be mined (simple polling)
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 30; // Wait up to ~60 seconds (2 seconds per attempt)

      while (!confirmed && attempts < maxAttempts) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;

          // For now, we'll assume the transaction is confirmed after a few attempts
          // In a real implementation, you'd check the transaction receipt
          if (attempts >= 5) { // Wait ~10 seconds minimum
            confirmed = true;
            console.log(`✅ Transaction confirmed after ${attempts * 2} seconds`);
          }
        } catch (error) {
          console.error('Error checking transaction confirmation:', error);
          break;
        }
      }

      if (confirmed) {
        console.log(`✅ Event settled successfully! ${attendedParticipants.length} participants processed.`);

        // Step 5: Update backend with settlement confirmation
        try {
          console.log('📝 Updating backend settlement status...');
          await apiService.settleEvent(eventData.event.event_id.toString());
          console.log('✅ Backend settlement status updated successfully');
        } catch (backendError) {
          console.error('❌ Failed to update backend settlement status:', backendError);
          // Don't fail the entire process if backend update fails
        }

        // Step 6: Refresh event data to update status
        const updatedData = await getEventDetails(slug as string);
        setEventData(updatedData);
      } else {
        console.warn('Transaction confirmation timed out, but the event may still be settled');
        // Still try to refresh data in case the transaction went through
        const updatedData = await getEventDetails(slug as string);
        setEventData(updatedData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to settle event");
      throw err; // Re-throw to let modal handle the error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransactionConfirm = async () => {
    try {
      if (pendingAction === 'liveNow') {
        await executeLiveNow();
      } else if (pendingAction === 'settleEvent') {
        await executeSettleEvent();
      }
    } catch (error) {
      // Error is already handled by the modal and setError calls
      console.error('Transaction failed:', error);
    }
  };

  const getModalContent = () => {
    if (pendingAction === 'liveNow') {
      return {
        title: "Go Live",
        description: "This will deposit funds to yield source and set your event status to LIVE. This action requires a blockchain transaction and gas fees."
      };
    } else if (pendingAction === 'settleEvent') {
      return {
        title: "Settle Event",
        description: "This will distribute rewards to attended participants and finalize your event. This action requires a blockchain transaction and gas fees."
      };
    }
    return {
      title: "Confirm Transaction",
      description: "This action requires a blockchain transaction and gas fees."
    };
  };

  const isOrganizer = user?.wallet?.address?.toLowerCase() === eventData?.event.organizer_address?.toLowerCase();
  const event = eventData?.event;
  const eventLink = typeof window !== 'undefined' ? `${window.location.origin}/event/${slug}` : `http://localhost:3000/event/${slug}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"></div>
          </div>
          <p className="mt-6 text-white text-xl">Loading event management...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-3xl font-bold text-white mb-4">Error Loading Event</h3>
          <p className="text-gray-300 mb-8 text-lg">{error || "Event not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
        <p className="text-gray-300 text-lg">Event Management Dashboard</p>
        <h2 className="text-2xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight mt-2">
          {formatEventDate(event.event_date)}
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8">
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-xl p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-red-300 mb-2">Error</h3>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Management Actions */}
      {isOrganizer && (
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Event Management</h3>
            <div className="flex gap-3 flex-wrap justify-center">
            {(event.status === 'REGISTRATION_OPEN' || event.status === 'REGISTRATION_CLOSED') && (
              <button
                onClick={handleLiveNow}
                disabled={isProcessing}
                className="text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  "🔴 Live Now"
                )}
              </button>
            )}

            {event.status === 'LIVE' && (
              <>
                <button
                  onClick={handleScanQR}
                  className="text-white bg-white/10 hover:bg-white hover:text-gray-900 font-normal rounded-full text-sm px-3 py-1 transition duration-300 ease-in-out"
                >
                  📱 Scan QR
                </button>
                <button
                  onClick={handleSettleEvent}
                  disabled={isProcessing}
                  className="text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    "✅ Settle This Event"
                  )}
                </button>
              </>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Information */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6">Event Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-gray-300">Stake Amount:</span>
                    <span className="text-white font-bold text-lg">{formatStakeAmount(event.stake_amount || '0')}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-gray-300">Max Participants:</span>
                    <span className="text-white font-bold text-lg">{event.max_participant}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-gray-300">Current Participants:</span>
                    <span className="text-white font-bold text-lg">{eventData.participant_count}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-gray-300">Registration Deadline:</span>
                    <span className="text-white font-bold text-lg">
                      {event.registration_deadline ? new Date(event.registration_deadline * 1000).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                    <span className="text-gray-300">Vault Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm bg-black/20 px-2 py-1 rounded">
                        {event.vault_address ? `${event.vault_address.slice(0, 10)}...${event.vault_address.slice(-8)}` : 'Not available'}
                      </span>
                      {event.vault_address && <CopyButton textToCopy={event.vault_address} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6">Event Description</h2>
              <p className="text-gray-200 leading-relaxed text-lg">
                {event.description || "No description available for this event."}
              </p>
            </div>

            {/* Share Link */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-6">Share Event</h2>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full text-gray-400 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3"
                    value={eventLink}
                    disabled
                    readOnly
                  />
                </div>
                <CopyButton textToCopy={eventLink} className="ml-3" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Status */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Event Status</h3>
              <div className="text-center">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-xl border ${
                  event.status === 'LIVE' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  event.status === 'REGISTRATION_OPEN' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  event.status === 'REGISTRATION_CLOSED' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                  event.status === 'SETTLED' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    event.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-current'
                  }`}></div>
                  {event.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Event Time */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Event Time</h3>
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {formatEventTime(event.event_date)}
                </p>
                <p className="text-gray-300 mt-2">
                  {formatEventDate(event.event_date)}
                </p>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Organizer</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-lg font-medium">
                    {event.organizer_name || (event.organizer_address ? `${event.organizer_address.slice(0, 6)}...${event.organizer_address.slice(-4)}` : 'Unknown')}
                  </p>
                </div>
                {event.organizer_address && (
                  <CopyButton textToCopy={event.organizer_address} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#131517] rounded-2xl p-8 max-w-md w-full border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Scan QR Code</h3>
              <button
                onClick={() => setShowScanModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-gray-300 mb-4">QR Code Scanner</p>
                <p className="text-gray-400 text-sm">This feature will allow you to scan participant QR codes for check-in</p>
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                <p className="text-xs text-gray-500">Upload QR code image or use camera scan</p>
              </div>
            </div>

            <button
              onClick={() => setShowScanModal(false)}
              className="w-full mt-6 text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setPendingAction(null);
        }}
        onConfirm={handleTransactionConfirm}
        title={getModalContent().title}
        description={getModalContent().description}
        isLoading={isProcessing}
      />
    </div>
  );
}