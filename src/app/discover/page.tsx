"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/organism/Navbar";
import Image from "next/image";
import Link from "next/link";
import { apiService, Event } from "@/utils/api";
import { usePrivy } from "@privy-io/react-auth";
import { handleMouseMove } from "@/utils/handleInput";
import CopyButton from "@/components/ui/CopyButton";

const MAX_SHIFT = 15;

export default function DiscoverPage() {
  const { authenticated, user } = usePrivy();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Handle image errors gracefully
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/api/og/width/400/height/400'; // Fallback to Next.js default OG image
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getEvents();
        console.log("API Response:", response); // Debug log
        setEvents(Array.isArray(response.events) ? response.events : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
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

  const filteredEvents = (events || []).filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const eventDate = new Date(event.event_date * 1000);
    const now = new Date();

    let matchesStatus = true;
    if (statusFilter === 'upcoming') {
      matchesStatus = eventDate > now;
    } else if (statusFilter === 'past') {
      matchesStatus = eventDate <= now;
    }

    return matchesSearch && matchesStatus;
  });

  const formatEventDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatEventTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
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

  const getParticipantPercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getParticipantBarColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
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
          {/* Navbar */}
          <Navbar active="discover" />

          {/* Header */}
          <div className="text-center mb-8 mt-8">
            <h1 className="text-base text-white mb-2">DISCOVER</h1>
            <div>
              <h1 className="text-5xl font-medium text-white">Explore Events</h1>
              <h2 className="text-3xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                Find your next experience
              </h2>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Filters and Search */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/10">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-300">
                      🔍
                    </span>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setStatusFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      statusFilter === 'upcoming'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setStatusFilter('past')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      statusFilter === 'past'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Past
                  </button>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      statusFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <div className="text-red-400 mb-4">
                <span className="text-6xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Error Loading Events</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const eventDate = new Date(event.event_date * 1000);
                  const isOrganizer = user?.wallet?.address?.toLowerCase() === event.organizer_address?.toLowerCase();

                  return (
                    <div key={event.event_id} className="group bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
                      {/* Event Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 via-pink-500 to-orange-500">
                        {event.image_url && event.image_url !== "https://example.com/image.jpg" ? (
                          <Image
                            src={event.image_url}
                            alt={event.title}
                            fill
                            className="object-cover"
                            onError={handleImageError}
                            unoptimized={true}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-6xl">🎉</span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl border ${getStatusColor(event.status)}`}>
                            <div className={`w-2 h-2 rounded-full ${
                              event.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-current'
                            }`}></div>
                            {event.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Organizer Badge */}
                        {isOrganizer && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ✨ Organizer
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                          <p className="text-gray-200 text-sm line-clamp-3 mb-3">
                            {event.description || "No description available for this event."}
                          </p>
                        </div>

                        <div className="space-y-3 text-sm text-gray-300 mb-4">
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{formatEventDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>⏰</span>
                            <span>{formatEventTime(event.event_date)}</span>
                          </div>

                          {/* Participants with Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span>👥</span>
                                <span>{event.current_participants || 0}/{event.max_participant} participants</span>
                              </div>
                              <span className="text-xs">
                                {getParticipantPercentage(event.current_participants || 0, event.max_participant)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 transition-all duration-300"
                                style={{ width: `${getParticipantPercentage(event.current_participants || 0, event.max_participant)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span>{(parseInt(event.stake_amount) / 1000000).toFixed(2)} USDC</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs">Organizer:</span>
                            <span className="text-white font-mono text-sm bg-black/20 px-2 py-1 rounded">
                              {event.organizer_address ? `${event.organizer_address.slice(0, 6)}...${event.organizer_address.slice(-4)}` : 'Unknown'}
                            </span>
                            {event.organizer_address && <CopyButton textToCopy={event.organizer_address} />}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Link href={`/event/${event.event_id}`} className="flex-1">
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-all">
                              View Details
                              <span>→</span>
                            </button>
                          </Link>

                          {isOrganizer && (
                            <Link href={`/event/manage/${event.event_id}`}>
                              <button className="p-2 text-white bg-white/10 hover:bg-white hover:text-gray-900 font-normal rounded-full transition-all">
                                ⚙️
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="text-gray-400 mb-4">
                    <span className="text-6xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">No Events Found</h3>
                  <p className="text-gray-300">
                    {searchTerm ? "Try adjusting your search terms or filters" : "No events available at the moment. Check back later!"}
                  </p>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>
    </section>
    </>
  );
}