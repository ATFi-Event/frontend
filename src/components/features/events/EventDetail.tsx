"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiService, Event } from "@/utils/api";
import { usePrivy } from "@privy-io/react-auth";
import { web3Service } from "@/utils/web3";
import QRCode from "qrcode";

interface Participant {
  id: string;
  user_address: string;
  name?: string;
  checked_in_at?: string;
  is_validated: boolean;
}

interface Registration {
  registration_id: string;
  qr_data: string;
  checked_in_at?: string;
  is_validated: boolean;
}

export default function EventDetail({ eventId }: { eventId: string }) {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'qr'>('details');

  // Form states
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegisteringContract, setIsRegisteringContract] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await apiService.getEvent(eventId);
        setEvent(eventData);

        // Get participant count from backend
        const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}`);
        const singleEventData = await response.json();
        setParticipantCount(singleEventData.participant_count || 0);

        // Check if user is already registered
        if (authenticated && user?.wallet?.address) {
          await checkUserRegistration();
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId, authenticated, user?.wallet?.address]);

  const checkUserRegistration = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/events/${eventId}/registration?user=${user?.wallet?.address}`
      );
      if (response.ok) {
        const regData = await response.json();
        setRegistration(regData);
      }
    } catch (err) {
      console.log("User not registered or error checking registration");
    }
  };

  const loadParticipants = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}/checkins`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error("Failed to load participants:", err);
    }
  };

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
        return "bg-green-100 text-green-800";
      case "REGISTRATION_OPEN":
        return "bg-blue-100 text-blue-800";
      case "REGISTRATION_CLOSED":
        return "bg-yellow-100 text-yellow-800";
      case "SETTLED":
        return "bg-gray-100 text-gray-800";
      case "VOIDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const generateQRCode = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data);
      setQrCodeUrl(url);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  const handleRegister = async () => {
    if (!authenticated || !user?.wallet?.address) {
      setError("Please connect your wallet to register for this event");
      return;
    }

    try {
      setIsRegistering(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: user.wallet.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const result = await response.json();
      setRegistration(result);
      await generateQRCode(result.qr_data);

      alert("Successfully registered for event! Save your QR code for check-in.");
      console.log("Registration successful:", result);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleContractRegistration = async () => {
    if (!authenticated || !user?.wallet?.address) {
      setError("Please connect your wallet to register for this event");
      return;
    }

    try {
      setIsRegisteringContract(true);
      setError(null);

      // Call smart contract to register for event with staking
      const txHash = await web3Service.registerForEvent(
        event?.vault_address || '',
        event?.stake_amount || '0'
      );

      // Create off-chain record with event ID from smart contract
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: user.wallet.address,
          transactionHash: txHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Smart contract registration failed");
      }

      const result = await response.json();
      setRegistration(result);
      await generateQRCode(result.qr_data);

      alert(`Successfully registered with smart contract! Transaction: ${txHash}`);
      console.log("Smart contract registration successful:", result);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Smart contract registration failed");
    } finally {
      setIsRegisteringContract(false);
    }
  };

  const handleDeposit = async () => {
    if (!authenticated || !user?.wallet?.address || !depositAmount) {
      setError("Please enter a deposit amount");
      return;
    }

    try {
      setIsDepositing(true);
      setError(null);

      const txHash = await web3Service.depositToEvent(
        event?.vault_address || '',
        depositAmount
      );

      alert(`Successfully deposited ${depositAmount} USDC! Transaction: ${txHash}`);
      setDepositAmount('');

      // Reload participant count as it might have changed
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}`);
      const singleEventData = await response.json();
      setParticipantCount(singleEventData.participant_count || 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleScanQR = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result as string;
        // You would need a QR code scanning library here
        // For now, we'll simulate the scan
        const qrData = prompt("Enter QR code data (simulating scan):");

        if (qrData) {
          const response = await fetch(`http://localhost:8080/api/v1/checkin/validate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              qr_data: qrData,
              validator_address: user?.wallet?.address,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            alert(`Successfully checked in participant: ${result.user_address}`);
            await loadParticipants(); // Refresh participant list
          } else {
            const error = await response.json();
            alert(`Check-in failed: ${error.error}`);
          }
        }
      } catch (err) {
        alert("Failed to process QR code");
      } finally {
        setIsScanning(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const isOrganizer = user?.wallet?.address?.toLowerCase() === event?.organizer_address?.toLowerCase();
  const progressPercentage = (event?.max_participant && event.max_participant > 0) ? (participantCount / event.max_participant) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto"></div>
          <p className="mt-6 text-white text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-6">
            <span className="material-symbols-outlined text-7xl">error</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Error</h3>
          <p className="text-gray-300 mb-6">{error || "Event not found"}</p>
          <button
            onClick={() => router.push("/home")}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/home" className="flex items-center text-white hover:text-purple-300 transition-colors">
              <span className="material-symbols-outlined mr-2">arrow_back</span>
              Back to Home
            </Link>
            {isOrganizer && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                >
                  <span className="material-symbols-outlined mr-2">qr_code_scanner</span>
                  {isScanning ? "Scanning..." : "Scan QR Code"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScanQR}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Event Header */}
      <div className="relative">
        {event.image_url && (
          <div className="h-80 bg-cover bg-center" style={{ backgroundImage: `url(${event.image_url})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>
        )}
        <div className="relative z-10 px-4 pb-8 pt-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-white mb-3">{event.title}</h1>
                <p className="text-gray-200 text-xl mb-4">
                  Organizer: {event.organizer_name || (event.organizer_address ? `${event.organizer_address.slice(0, 6)}...${event.organizer_address.slice(-4)}` : 'Unknown')}
                </p>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                    {event.status.replace("_", " ")}
                  </span>
                  {isOrganizer && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      <span className="material-symbols-outlined mr-1 text-sm">verified</span>
                      Organizer
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-3xl font-bold">
                  {formatEventDate(event.event_date)}
                </p>
                <p className="text-gray-200 text-lg">
                  {formatEventTime(event.event_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'details', label: 'Event Details', icon: 'info' },
                { id: 'participants', label: 'Participants', icon: 'groups' },
                registration && { id: 'qr', label: 'My QR Code', icon: 'qr_code' },
              ].filter(Boolean).map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'participants') {
                      loadParticipants();
                    }
                  }}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="material-symbols-outlined mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">About this Event</h2>
                <p className="text-gray-200 leading-relaxed text-lg">
                  {event.description || "No description available for this event."}
                </p>
              </div>

              {/* Event Details */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Event Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Stake Amount:</span>
                      <span className="text-white font-bold text-lg">{formatStakeAmount(event.stake_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Max Participants:</span>
                      <span className="text-white font-bold text-lg">{event.max_participant}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Current Participants:</span>
                      <span className="text-white font-bold text-lg">{participantCount}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Registration Deadline:</span>
                      <span className="text-white font-bold text-lg">
                        {new Date(event.registration_deadline * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Vault Address:</span>
                      <span className="text-white font-mono text-sm bg-black/20 px-2 py-1 rounded">
                        {event.vault_address ? `${event.vault_address.slice(0, 10)}...${event.vault_address.slice(-8)}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Event ID:</span>
                      <span className="text-white font-bold text-lg">{event.event_id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Section */}
              {authenticated && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6">Additional Deposit</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Deposit Amount (USDC)</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter amount to deposit"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      {isDepositing ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Processing Deposit...
                        </span>
                      ) : (
                        "Deposit USDC"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Registration Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Participants</span>
                    <span className="text-white font-bold">{participantCount}/{event.max_participant}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-300 text-center">
                    {progressPercentage.toFixed(1)}% filled
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Event Actions</h3>
                <div className="space-y-3">
                  {authenticated ? (
                    registration ? (
                      <div className="text-center py-4">
                        <span className="material-symbols-outlined text-5xl text-green-400 mb-3">check_circle</span>
                        <p className="text-green-400 font-medium mb-3">You're registered!</p>
                        <button
                          onClick={() => {
                            generateQRCode(registration.qr_data);
                            setActiveTab('qr');
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                        >
                          View Your QR Code
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleRegister}
                          disabled={isRegistering || participantCount >= event.max_participant}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                          {isRegistering ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Registering...
                            </span>
                          ) : participantCount >= event.max_participant ? (
                            "Event Full"
                          ) : (
                            "Register for Event"
                          )}
                        </button>

                        <button
                          onClick={handleContractRegistration}
                          disabled={isRegisteringContract}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                          {isRegisteringContract ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Connecting to Contract...
                            </span>
                          ) : (
                            "Register with Smart Contract"
                          )}
                        </button>
                      </>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">lock</span>
                      <p className="text-gray-300 mb-4">Connect your wallet to register</p>
                      <button
                        onClick={() => router.push("/signin")}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Event Participants</h2>
            {participants.length > 0 ? (
              <div className="grid gap-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${participant.is_validated ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <p className="text-white font-medium">
                          {participant.name || `${participant.user_address.slice(0, 6)}...${participant.user_address.slice(-4)}`}
                        </p>
                        <p className="text-gray-400 text-sm">{participant.user_address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${participant.is_validated ? 'text-green-400' : 'text-yellow-400'}`}>
                        {participant.is_validated ? 'Checked In' : 'Registered'}
                      </p>
                      {participant.checked_in_at && (
                        <p className="text-gray-400 text-xs">
                          {new Date(participant.checked_in_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">groups</span>
                <p className="text-gray-300">No participants yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'qr' && registration && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Event QR Code</h2>
            <div className="text-center">
              {qrCodeUrl ? (
                <div className="space-y-6">
                  <div className="inline-block p-6 bg-white rounded-2xl">
                    <img src={qrCodeUrl} alt="Event QR Code" className="w-64 h-64" />
                  </div>
                  <p className="text-gray-300">Show this QR code at the event entrance for check-in</p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Registration ID: {registration.registration_id}</p>
                    <p>Event ID: {eventId}</p>
                    <p>Wallet: {user?.wallet?.address?.slice(0, 10)}...{user?.wallet?.address?.slice(-8)}</p>
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-white">Generating QR code...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQrModal && qrCodeUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Your QR Code</h3>
              <img src={qrCodeUrl} alt="Event QR Code" className="w-48 h-48 mx-auto" />
              <p className="text-gray-600 text-sm">Show this code at event check-in</p>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}