"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiService, Event } from "@/utils/api";
import { handleMouseMove } from "@/utils/handleInput";
import CopyButton from "@/components/ui/CopyButton";

const MAX_SHIFT = 15;

export default function EventsDiscovery() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getEvents();
        setEvents(response.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === "all" || event.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const formatEventDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
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
      default:
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

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
            <p className="mt-6 text-white text-xl">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
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
            <h3 className="text-3xl font-bold text-white mb-4">Error Loading Events</h3>
            <p className="text-gray-300 mb-8 text-lg">{error}</p>
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
        {/* Navigation */}
        <nav className="p-4">
          <div className="flex justify-between items-center-safe">
            <h1 className="text-white font-bold">ATFI</h1>

            <div className="flex gap-5 justify-center items-center me-2">
              <Link href="/home" className="flex justify-center items-center text-white hover:text-purple-400 group">
                <span className="group-hover:rotate-90 transition duration-300 ease-in-out mr-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </span>
                Home
              </Link>
              <Link
                href="/signin"
                className="text-white bg-white/10 hover:bg-white hover:text-gray-900 font-normal rounded-full text-sm px-3 py-1 transition duration-300 ease-in-out"
              >
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-base text-white mb-2">DISCOVER</h1>
            <div>
              <h1 className="text-5xl font-medium text-white">Explore Events</h1>
              <h2 className="text-3xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                Find your next experience
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="registration_open">Registration Open</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="live">Live</option>
                <option value="settled">Settled</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">📅</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-300">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link
                  key={event.event_id}
                  href={`/event/${event.event_id}`}
                  className="group bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">
                            by {event.organizer_name || `${event.organizer_address.slice(0, 6)}...${event.organizer_address.slice(-4)}`}
                          </p>
                          {event.organizer_address && (
                            <CopyButton textToCopy={event.organizer_address} />
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl border ${getStatusColor(event.status)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          event.status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-current'
                        }`}></div>
                        {event.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-gray-200 mb-6 line-clamp-2">
                      {event.description || "No description available"}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        {formatEventDate(event.event_date)} at {formatEventTime(event.event_date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                        {formatStakeAmount(event.stake_amount)} stake
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        {event.current_participants || 0}/{event.max_participant}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 h-2 rounded-full"
                            style={{ width: `${((event.current_participants || 0) / event.max_participant) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}