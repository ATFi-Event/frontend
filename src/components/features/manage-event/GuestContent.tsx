"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { getEventParticipants, getEventDetails, EventMetadataResponse, ParticipantWithProfile } from "@/utils/api/events";
import QRScanner from "./QRScanner";
import CopyButton from "@/components/ui/CopyButton";


export default function GuestContent() {
  const { slug } = useParams();
  const { authenticated, user } = usePrivy();

  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([]);
  const [eventData, setEventData] = useState<EventMetadataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        console.log("🔄 Loading guest data for event:", slug);

        // Load both event details and participants in parallel
        const [eventData, participantsData] = await Promise.all([
          getEventDetails(slug as string),
          getEventParticipants(slug as string)
        ]);

        console.log("📊 Event data loaded:", eventData);
        console.log("👥 Participants data loaded:", participantsData);
        console.log("📈 Participant count:", participantsData.length);

        setEventData(eventData);
        setParticipants(participantsData);
      } catch (err) {
        console.error("❌ Failed to load guest data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const registeredNumber = eventData?.participant_count || participants.length;
  const checkedInNumber = participants.filter(p => p.is_attend).length;
  const claimedNumber = participants.filter(p => p.is_claim).length;
  const maxParticipants = eventData?.event?.max_participant || 50; // Use event data or fallback to 50
  const registrationProgress = Math.min(100, (registeredNumber / maxParticipants) * 100);
  const attendanceRate = registeredNumber > 0 ? (checkedInNumber / registeredNumber) * 100 : 0;

  const handleCheckInSuccess = (participantData: { user_id: string, user_address: string }) => {
    // Update participant list
    setParticipants(prev =>
      prev.map(p =>
        p.user_id === participantData.user_id
          ? { ...p, is_attend: true }
          : p
      )
    );
  };

  const filteredParticipants = participants.filter(participant =>
    participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.user_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"></div>
          </div>
          <p className="mt-6 text-white text-xl">Loading participants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-3xl font-bold text-white mb-4">Error Loading Participants</h3>
          <p className="text-gray-300 mb-8 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Event Guests</h1>
        <p className="text-gray-300 text-lg">Manage and track event participants</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Registered</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{registeredNumber}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Checked In</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">{checkedInNumber}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Claimed Rewards</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">{claimedNumber}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Capacity</p>
              <p className="text-3xl font-bold text-gray-300 mt-1">{maxParticipants}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Registration Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Registration Fill</span>
              <span className="text-green-400 font-medium">{registrationProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${registrationProgress}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Attendance Rate</span>
              <span className="text-blue-400 font-medium">{attendanceRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${attendanceRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Search by name, email, or wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowQRScanner(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan QR Code
        </button>
      </div>

      {/* Participants List */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">
            Guest List ({filteredParticipants.length})
          </h3>
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">👥</div>
            <p className="text-gray-400 text-lg">
              {searchTerm
                ? "No participants found matching your search."
                : registeredNumber > 0
                  ? "Participant data not available in backend. Only registration count is shown."
                  : "No participants registered yet."
              }
            </p>
            {registeredNumber > 0 && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  ℹ️ The backend shows {registeredNumber} registered participant(s), but individual participant details are not available.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredParticipants.map((participant) => (
              <div key={participant.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {(participant.name || participant.username)?.charAt(0)?.toUpperCase() || participant.user_address.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg">
                        {participant.name || participant.username || "Anonymous User"}
                      </h4>
                      {participant.username && participant.name && (
                        <p className="text-gray-400 text-sm">@{participant.username}</p>
                      )}
                      {participant.email && (
                        <p className="text-gray-400 text-sm">{participant.email}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-xs font-mono">
                          {participant.user_address.slice(0, 6)}...{participant.user_address.slice(-4)}
                        </p>
                        <CopyButton textToCopy={participant.user_address} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-600 text-xs font-mono">
                          ID: {participant.user_id.slice(0, 8)}...
                        </p>
                        <CopyButton textToCopy={participant.user_id} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xl border ${
                        participant.is_claim
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : participant.is_attend
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          participant.is_claim
                            ? 'bg-purple-400'
                            : participant.is_attend
                            ? 'bg-green-400 animate-pulse'
                            : 'bg-yellow-400'
                        }`}></div>
                        {participant.is_claim ? 'Reward Claimed' : participant.is_attend ? 'Checked In' : 'Registered'}
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(participant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        eventId={parseInt(slug as string)}
        onCheckInSuccess={handleCheckInSuccess}
      />
    </div>
  );
}
