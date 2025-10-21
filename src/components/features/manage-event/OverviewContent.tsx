"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { getEventDetails } from "@/utils/api/events";
import { handleMouseMove } from "@/utils/handleInput";
import CopyButton from "@/components/ui/CopyButton";

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
  const { eventId } = useParams();
  const { authenticated, user } = usePrivy();

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showScanModal, setShowScanModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const data = await getEventDetails(eventId as string);
        setEventData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event data");
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

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

  const handleLiveNow = async () => {
    if (!eventData) return;

    try {
      setIsProcessing(true);
      // Call backend API to change event status to LIVE
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventData.event.event_id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "LIVE"
        }),
      });

      if (response.ok) {
        // Refresh event data
        const updatedData = await getEventDetails(eventId as string);
        setEventData(updatedData);
      } else {
        throw new Error("Failed to update event status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set event live");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanQR = () => {
    setShowScanModal(true);
  };

  const handleSettleEvent = async () => {
    if (!eventData) return;

    try {
      setIsProcessing(true);
      // Call backend API to settle the event
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventData.event.event_id}/settle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Refresh event data
        const updatedData = await getEventDetails(eventId as string);
        setEventData(updatedData);
      } else {
        throw new Error("Failed to settle event");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to settle event");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOrganizer = user?.wallet?.address?.toLowerCase() === eventData?.event.organizer_address?.toLowerCase();
  const event = eventData?.event;
  const eventLink = typeof window !== 'undefined' ? `${window.location.origin}/event/${eventId}` : `http://localhost:3000/event/${eventId}`;

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
            <p className="mt-6 text-white text-xl">Loading event management...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !event) {
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
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-3xl font-bold text-white mb-4">Error Loading Event</h3>
            <p className="text-gray-300 mb-8 text-lg">{error || "Event not found"}</p>
          </div>
        </div>
      </section>
    );
  }

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

      <div className="relative z-10">
        {/* Header */}
        <div className="p-4">
          <div className="flex justify-between items-center-safe">
            <h1 className="text-white font-bold">ATFI</h1>

            <div className="flex gap-5 justify-center items-center me-2">
              <div className="text-white">
                <h1 className="text-base text-white mb-2">EVENT MANAGEMENT</h1>
                <div>
                  <h1 className="text-3xl font-medium text-white">{event.title}</h1>
                  <h2 className="text-2xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                    {formatEventDate(event.event_date)}
                  </h2>
                </div>
              </div>
              <Link
                href="/signin"
                className="text-white bg-white/10 hover:bg-white hover:text-gray-900 font-normal rounded-full text-sm px-3 py-1 transition duration-300 ease-in-out"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-4">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              <p className="font-medium">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Management Actions */}
        {isOrganizer && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
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
        )}

        {/* Event Details */}
        <div className="max-w-4xl mx-auto px-4 py-12">
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
      </div>
    </section>
  );
}