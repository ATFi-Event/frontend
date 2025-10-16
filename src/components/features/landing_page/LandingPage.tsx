"use client";
import { useEffect, useState } from "react";
import { formatTime } from "@/utils/formaterDateAndTime";
import { handleMouseMove } from "@/utils/handleInput";
import Link from "next/link";

// Batas pergerakan maksimum (misalnya 15 piksel)
const MAX_SHIFT = 15;

export default function Landing() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerID);
  }, []);

  useEffect(() => {
    const listener = (event: MouseEvent) =>
      handleMouseMove(event, setPosition, MAX_SHIFT);

    window.addEventListener("mousemove", listener);
    return () => {
      window.removeEventListener("mousemove", listener);
    };
  }, []);

  return (
    <>
      <section className="p-4 h-screen bg-[#131517] relative overflow-hidden">
        {/* HIASAN BG */}
        <div
          className="absolute top-0 left-0 w-full h-full light-orb z-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          {/* Div untuk gradient (contoh dari CSS di atas) */}
          <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse-slow"></div>
          <div className="absolute w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-3xl bottom-20 right-10 animate-pulse-slow delay-500"></div>
        </div>

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
              <Link
                href="/signin"
                className="text-[#939094] bg-[#93909437] hover:bg-[#939094] hover:text-white font-normal rounded-full text-sm px-3 py-1 transition duration-300 ease-in-out"
              >
                Sign In
              </Link>
            </div>
          </div>
          {/* END Header */}

          {/* Main */}
          <main className="flex items-center justify-center h-5/6">
            <div className="flex flex-col gap-3 w-3/6">
              <h1 className="text-base">ATFI PROJECT</h1>
              <div>
                <h1 className="text-5xl font-medium">Where great events are</h1>
                <h2 className="text-5xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                  brought to life.
                </h2>
              </div>
              <p>
                Build your perfect page, invite your community, and generate
                revenue immediately. <br /> It&apos;s time to host the event everyone
                will talk about.
              </p>
              <div>
                <Link
                  href="/create"
                  className="text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2"
                >
                  Start Organizing
                </Link>
              </div>
            </div>
          </main>
          {/* END Main */}
        </div>
      </section>
    </>
  );
}
