"use client";

import { Providers } from "@/components/features/signin/PrivyProvider";
import { formatTime } from "@/utils/formaterDateAndTime";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerID);
  }, []);

  return (
    <>
      <section className="p-4 h-screen bg-[#131517] relative overflow-hidden">
        <div className="h-full relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center-safe">
            <h1 className="text-[#939094] font-bold">ATFI</h1>

            <div className="flex gap-5 justify-center items-center me-2">
              <h1 className="text-[#939094]">{formatTime(currentTime)}</h1>
              <Link href="/discover">
                <h1 className="flex justify-center items-center text-[#939094] hover:text-white group">
                  Explore Events
                  <span className="material-symbols-outlined group-hover:rotate-90 transition duration-300 ease-in-out ">
                    arrow_upward
                  </span>
                </h1>
              </Link>
            </div>
          </div>
          {/* END Header */}

          {/* Untuk Pop Up Privy */}
          <Providers>{children}</Providers>
          {/* END Untuk Pop Up Privy */}
        </div>
      </section>
    </>
  );
}
