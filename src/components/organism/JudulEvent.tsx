import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getEventDetails } from "@/utils/api/events";
import Link from "next/link";

export default function JudulEvent() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const data = await getEventDetails(eventId as string);
        setEventData(data.event);
      } catch (err) {
        console.error("Failed to load event data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  const formatEventDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`mx-[240px] pt-10 px-4`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className={`mx-[240px] pt-10 px-4`}>
        <h2 className="text-4xl font-semibold text-white">Event Not Found</h2>
      </div>
    );
  }

  return (
    <div className={`mx-[240px] pt-10 px-4`}>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-4xl font-semibold text-white">{eventData.title}</h2>
        <Link
          href={`/event/${eventData.event_id}`}
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>View Event</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 0 24 24"
            width="20px"
            fill="currentColor"
            className="ml-2"
          >
            <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
          </svg>
        </Link>
      </div>
      <p className="text-2xl text-gray-300">
        {formatEventDate(eventData.event_date)}
      </p>
    </div>
  );
}
