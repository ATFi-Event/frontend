"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiService, Event } from "@/utils/api";

export default function EventsDiscovery() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
        return "bg-green-100 text-green-800";
      case "REGISTRATION_OPEN":
        return "bg-blue-100 text-blue-800";
      case "REGISTRATION_CLOSED":
        return "bg-yellow-100 text-yellow-800";
      case "SETTLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003251] to-[#001f3f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003251] to-[#001f3f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <span className="material-symbols-outlined text-6xl">error</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error loading events</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003251] to-[#001f3f] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Discover Events</h1>
          <p className="text-gray-300 text-lg">
            Explore blockchain-powered events with guaranteed attendance through staking
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
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
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">event</span>
            <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.event_id}
                href={`/event/${event.event_id}`}
                className="group bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        by {event.organizer_name || `${event.organizer_address.slice(0, 6)}...${event.organizer_address.slice(-4)}`}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-6 line-clamp-2">
                    {event.description || "No description available"}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="material-symbols-outlined mr-2 text-lg">calendar_month</span>
                      {formatEventDate(event.event_date)} at {formatEventTime(event.event_date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="material-symbols-outlined mr-2 text-lg">payments</span>
                      {formatStakeAmount(event.stake_amount)} stake
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="material-symbols-outlined mr-1">groups</span>
                      {event.current_participants || 0}/{event.max_participant}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
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
  );
}