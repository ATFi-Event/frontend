"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/organism/Navbar";
import Image from "next/image";
import Link from "next/link";
import { apiService, Event } from "@/utils/api";
import { usePrivy } from "@privy-io/react-auth";
import { handleMouseMove } from "@/utils/handleInput";
import CopyButton from "@/components/ui/CopyButton";

// Custom SVG Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="96" height="96" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);

const ScheduleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const GroupsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

const VerifiedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
);

const MAX_SHIFT = 15;

export default function HomePage() {
  const { authenticated, user } = usePrivy();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Handle image errors gracefully
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/api/og/width/80/height/80'; // Fallback to Next.js default OG image
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        console.log("HomePage: Loading events..."); // Debug log
        const response = await apiService.getEvents();
        console.log("HomePage: API Response:", response); // Debug log

        // Handle the actual backend response format
        if (response.events && Array.isArray(response.events)) {
          setEvents(response.events);
        } else if (Array.isArray(response)) {
          setEvents(response);
        } else {
          console.warn("HomePage: Unexpected response format:", response);
          setEvents([]);
        }
        setError(null);
      } catch (err) {
        console.error("HomePage: Error loading events:", err);
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
    const matchesStatus = statusFilter === 'upcoming' ? eventDate > now : eventDate <= now;

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
          <Navbar active="home" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header with Search and Filter */}
          <div className="text-center mb-8">
            <h1 className="text-base text-white mb-2">HOME</h1>
            <div>
              <h1 className="text-5xl font-medium text-white">Discover Events</h1>
              <h2 className="text-3xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                Find your next experience
              </h2>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
                <span className="absolute left-3 top-2.5 text-gray-300">
                  <SearchIcon />
                </span>
              </div>

              {/* Status Filter */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setStatusFilter('upcoming')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    statusFilter === 'upcoming'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setStatusFilter('past')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    statusFilter === 'past'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
          </div>

          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <ErrorIcon />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Events</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <div className="grid gap-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const eventDate = new Date(event.event_date * 1000);
                  const isOrganizer = user?.wallet?.address?.toLowerCase() === event.organizer_address?.toLowerCase();

                  return (
                    <div key={event.event_id} className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        {/* Event Date Card */}
                        <div className="md:w-48 p-6 bg-gradient-to-br from-blue-500 via-pink-500 to-orange-500 flex flex-col items-center justify-center text-white">
                          <div className="text-3xl font-bold">
                            {eventDate.getDate()}
                          </div>
                          <div className="text-lg">
                            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-sm opacity-90">
                            {eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-white">{event.title}</h3>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-xl border ${getStatusColor(event.status)}`}>
                                  <div className={`w-2 h-2 rounded-full ${
                                    event.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-current'
                                  }`}></div>
                                  {event.status.replace('_', ' ')}
                                </span>
                                {isOrganizer && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    <span className="mr-1">
                                      <VerifiedIcon />
                                    </span>
                                    Organizer
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-200 mb-3 line-clamp-2">
                                {event.description || "No description available for this event."}
                              </p>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <ScheduleIcon />
                                  <span>{formatEventTime(event.event_date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GroupsIcon />
                                  <span>{event.current_participants || 0}/{event.max_participant}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <WalletIcon />
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
                            </div>

                            {event.image_url && event.image_url !== "https://example.com/image.jpg" && (
                              <div className="ml-4">
                                <Image
                                  src={event.image_url}
                                  alt={event.title}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 rounded-lg object-cover"
                                  onError={handleImageError}
                                  unoptimized={true}
                                />
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Link href={`/event/${event.event_id}`}>
                              <button className="text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center">
                                View Details
                                <ArrowRightIcon />
                              </button>
                            </Link>

                            {isOrganizer && (
                              <Link href={`/event/manage/${event.event_id}`}>
                                <button className="text-white bg-white/10 hover:bg-white hover:text-gray-900 font-normal rounded-full text-sm px-3 py-1 transition duration-300 ease-in-out">
                                  <SettingsIcon />
                                  Manage
                                </button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
                  <p className="text-gray-300">
                    {searchTerm ? "Try adjusting your search terms" : `No ${statusFilter} events available at the moment`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
    </>
  );
}