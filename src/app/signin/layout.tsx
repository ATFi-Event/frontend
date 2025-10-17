"use client";

import { Providers } from "@/components/features/PrivyProvider";
import NavbarNotLogin from "@/components/organism/NavbarNotLogin";
import { formatTime } from "@/utils/formaterDateAndTime";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="p-4 min-h-screen bg-[#131517] relative overflow-hidden">
        <div className="h-full relative z-10">
          {/* Header */}
          <NavbarNotLogin />
          {/* END Header */}

          {/* Untuk Pop Up Privy */}
          <Providers>{children}</Providers>
          {/* END Untuk Pop Up Privy */}
        </div>
      </section>
    </>
  );
}
