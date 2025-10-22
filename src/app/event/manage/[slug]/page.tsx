"use client";

import { useState, useEffect } from "react";
import OverviewContent from "@/components/features/manage-event/OverviewContent";
import ManageContent from "@/components/features/manage-event/ManageContent";
import GuestContent from "@/components/features/manage-event/GuestContent";
import { useParams, usePathname } from "next/navigation";
import { handleMouseMove } from "@/utils/handleInput";

const MAX_SHIFT = 15;

export default function EventManagePage() {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug;

  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for interactive background
  useEffect(() => {
    const listener = (event: MouseEvent) =>
      handleMouseMove(event, setPosition, MAX_SHIFT);

    window.addEventListener("mousemove", listener);
    return () => {
      window.removeEventListener("mousemove", listener);
    };
  }, []);

  // Determine active path from URL
  const getActivePath = () => {
    if (pathname.includes("/guests")) return "guests";
    return "overview"; // default
  };

  const activePath = getActivePath();

  return (
    <div className="relative overflow-hidden">
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
        {/* Main Content */}
        <div className="min-h-screen pt-4">
          <ManageContent path={activePath} />

          {/* Route content based on active path */}
          {activePath === "overview" && <OverviewContent />}
          {activePath === "guests" && <GuestContent />}
        </div>
      </div>
    </div>
  );
}
