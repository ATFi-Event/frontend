"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { handleMouseMove } from "@/utils/handleInput";
import CopyButton from "@/components/ui/CopyButton";
import DepositModal from "./DepositModal";
import Navbar from "@/components/organism/Navbar";
import { getParticipantStatus, claimReward } from "@/utils/api/events";
import { generateParticipantQRCode } from "@/utils/qrCode";

const MAX_SHIFT = 15;

// Event interface matching the backend API response
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

export default function EventDetail({ eventId }: { eventId: string }) {
  const { authenticated, user } = usePrivy();
  const router = useRouter();

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showQRModal, setShowQRModal] = useState(false);
  const [userIsAttended, setUserIsAttended] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [participantStatus, setParticipantStatus] = useState<any>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const handleDepositSuccess = () => {
    // Refresh event data to show updated participant count
    loadEvent();
    // Load participant status
    if (authenticated && user) {
      loadParticipantStatus();
    }
  };

  const loadParticipantStatus = async () => {
    if (!authenticated || !user || !event) return;

    try {
      const response = await getParticipantStatus(event.event_id, user.wallet?.address || '');
      setParticipantStatus(response.participant);
      setUserIsAttended(response.participant?.is_attend || false);
    } catch (error) {
      console.error('Error loading participant status:', error);
    }
  };

  const handleClaimReward = async () => {
    if (!authenticated || !user || !event) return;

    const userAddress = user.wallet?.address;
    if (!userAddress) {
      alert('Wallet address not available');
      return;
    }

    try {
      setClaimLoading(true);

      // First call smart contract function claimReward
      const { web3Service } = await import("@/utils/web3");
      web3Service.setProvider(user.wallet);

      const txHash = await web3Service.claimReward(event.vault_address);
      console.log("Claim Reward transaction hash:", txHash);

      // Wait for transaction confirmation
      // In a real implementation, you might want to wait for transaction confirmation

      // Then call backend API to record the claim
      const response = await claimReward({
        event_id: event.event_id,
        user_address: userAddress
      });

      if (response.success) {
        alert('Reward claimed successfully!');
        // Refresh participant status
        await loadParticipantStatus();
      } else {
        alert(response.message || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Failed to claim reward. Please try again.');
    } finally {
      setClaimLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!authenticated || !user || !event) return;

    const userId = user.id;
    if (!userId) return;

    try {
      const qrDataUrl = await generateParticipantQRCode(event.event_id, userId);
      setQrCodeDataUrl(qrDataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}`);
      const data = await response.json();
      setEventData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && eventId !== 'undefined') {
      loadEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (eventData?.event && authenticated && user) {
      loadParticipantStatus();
    }
  }, [eventData?.event, authenticated, user]);

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
    const usdcAmount = parseInt(amount) / 1000000; // Convert from 6 decimals
    return `${usdcAmount} USDC`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "REGISTRATION_OPEN":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "REGISTRATION_CLOSED":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "SETTLED":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "VOIDED":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const event = eventData?.event;

  // If event data is not loaded yet, don't render the main content
  if (!event || loading) {
    return null; // This will be handled by the loading state above
  }

  const progressPercentage = event && event.max_participant > 0 ? ((eventData?.participant_count || 0) / event.max_participant) * 100 : 0;

  if (loading) {
    return (
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

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"></div>
            </div>
            <p className="mt-6 text-white text-xl">Loading event details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
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

          <div className="relative z-10 flex items-center justify-center min-h-screen pt-16">
            <div className="text-center">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-3xl font-bold text-white mb-4">Error Loading Event</h3>
              <p className="text-gray-300 mb-8 text-lg">{error || "Event not found"}</p>
              <Link
                href="/discover"
                className="text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
              >
                Back to Discover
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />
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

        <div className="relative z-10 pt-16"> {/* Add padding-top to account for fixed navbar */}

        {/* Event Header */}
        <div className="relative">
          {event.image_url && event.image_url !== "https://example.com/image.jpg" ? (
            <div className="h-96 bg-cover bg-center relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${event.image_url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#131517] via-transparent to-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="h-96 bg-gradient-to-br from-blue-500/20 via-pink-500/20 to-orange-500/20 flex items-center justify-center">
              <span className="text-8xl opacity-50">🎉</span>
            </div>
          )}

          <div className="relative z-10 px-4 pb-8 pt-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-base text-white mb-2">EVENT DETAILS</h1>
                <div>
                  <h1 className="text-5xl font-medium text-white">{event.title}</h1>
                  <h2 className="text-3xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                    {formatEventDate(event.event_date)}
                  </h2>
                </div>
                <p className="text-white mt-4 max-w-2xl mx-auto">
                  {event.description || "Join this amazing event and be part of something special."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-xl border ${getStatusColor(event.status || 'UNKNOWN')}`}>
                  <div className={`w-2 h-2 rounded-full ${
                    event.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-current'
                  }`}></div>
                  {(event.status || 'UNKNOWN').replace('_', ' ')}
                </span>
                <span className="text-white text-sm">
                  Stake: {formatStakeAmount(event.stake_amount || '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {event.status === 'REGISTRATION_OPEN' && !participantStatus?.hasDeposited && (
            <button
              onClick={() => setShowDepositModal(true)}
              className="text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
            >
              Deposit to Join
            </button>
          )}

            {event.status === 'REGISTRATION_CLOSED' && (
              <button
                className="text-gray-900 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
              >
                Close This Register
              </button>
            )}

            {event.status === 'LIVE' && (
              <>

                {participantStatus?.is_attend ? (
                  <div className="text-white bg-green-500/20 backdrop-blur-lg rounded-lg px-5 py-2.5 text-center inline-flex items-center border border-green-500/30">
                    ✓ Already Checked In
                  </div>
                ) : participantStatus ? (
                  <button
                    onClick={generateQRCode}
                    className="text-gray-900 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                  >
                    Show QR Code
                  </button>
                ) : (
                  <div className="text-gray-400 bg-white/5 backdrop-blur-lg rounded-lg px-5 py-2.5 text-center inline-flex items-center">
                    Register to check in
                  </div>
                )}
              </>
            )}

            {event.status === 'SETTLED' && (
              <>
                {participantStatus?.is_attend ? (
                  participantStatus?.is_claim ? (
                    <div className="text-white bg-green-500/20 backdrop-blur-lg rounded-lg px-5 py-2.5 text-center inline-flex items-center border border-green-500/30">
                      ✓ You are already take a reward
                    </div>
                  ) : (
                    <button
                      onClick={handleClaimReward}
                      disabled={claimLoading}
                      className="text-gray-900 bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {claimLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          Claiming...
                        </div>
                      ) : (
                        'Claim Reward'
                      )}
                    </button>
                  )
                ) : (
                  <div className="text-gray-400 bg-white/5 backdrop-blur-lg rounded-lg px-5 py-2.5 text-center inline-flex items-center">
                    You are not eligible to claim this
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Event Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Information */}
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-6">Event Information</h2>
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
                      <span className="text-white font-bold text-lg">{eventData?.participant_count || 0}</span>
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
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-gray-300">Event ID:</span>
                      <span className="text-white font-bold text-lg">{event.event_id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-6">Event Organizer</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Organized by</p>
                    <p className="text-white text-lg font-medium">
                      {event.organizer_name || (event.organizer_address ? `${event.organizer_address.slice(0, 6)}...${event.organizer_address.slice(-4)}` : 'Unknown')}
                    </p>
                  </div>
                  {event.organizer_address && (
                    <CopyButton textToCopy={event.organizer_address} displayText="Copy Address" />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Progress */}
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">Registration Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Participants</span>
                    <span className="text-white font-bold">{eventData?.participant_count || 0}/{event.max_participant}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-300 text-center">
                    {progressPercentage.toFixed(1)}% filled
                  </p>
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
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && qrCodeDataUrl && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#131517] rounded-2xl p-8 max-w-md w-full border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Your Check-in QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl mb-6 flex items-center justify-center">
                <img src={qrCodeDataUrl} alt="Event Check-in QR Code" className="w-64 h-64" />
              </div>

              <div className="text-center text-gray-300 mb-4">
                <p className="text-sm">Show this QR code at the event venue</p>
                <p className="text-xs mt-2">Present to event staff for check-in</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-blue-400">Important</span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• This QR code is unique to your wallet and this event</li>
                  <li>• You can access it again from this event page</li>
                  <li>• Event ID: {event.event_id}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodeDataUrl);
                    alert('QR code copied to clipboard!');
                  }}
                  className="flex-1 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all"
                >
                  Copy QR Code
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {eventData && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={handleDepositSuccess}
          eventData={{
            event_id: eventData.event.event_id,
            vault_address: eventData.event.vault_address,
            stake_amount: eventData.event.stake_amount,
            title: eventData.event.title
          }}
        />
      )}
    </section>
    </>
  );
}