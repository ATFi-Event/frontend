"use client";

import { useState } from "react";
import OverviewContent from "@/components/features/manage-event/OverviewContent";
import ManageContent from "@/components/features/manage-event/ManageContent";
import GuestContent from "@/components/features/manage-event/GuestContent";
import { useParams, usePathname } from "next/navigation";
import Navbar from "@/components/organism/Navbar";

export default function EventManagePage() {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug;

  // Determine active path from URL
  const getActivePath = () => {
    if (pathname.includes("/guests")) return "guests";
    return "overview"; // default
  };

  const activePath = getActivePath();

  return (
    <div className="min-h-screen bg-[#131517]">
      <ManageContent path={activePath} />

      {/* Route content based on active path */}
      {activePath === "overview" && <OverviewContent />}
      {activePath === "guests" && <GuestContent />}
    </div>
  );
}
