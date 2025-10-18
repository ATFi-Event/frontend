"use client";
import { useEffect, useState } from "react";
import { formatTime } from "@/utils/formaterDateAndTime";
import { handleMouseMove } from "@/utils/handleInput";
import Link from "next/link";

// Batas pergerakan maksimum (misalnya 15 piksel)
const MAX_SHIFT = 15;

// Custom Logo Component
const ExploreLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/>
  </svg>
);

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
            <h1 className="text-white font-bold">ATFI</h1>

            <div className="flex gap-5 justify-center items-center me-2">
              <h1 className="text-white">{formatTime(currentTime)}</h1>
              <Link href="/discover">
                <h1 className="flex justify-center items-center text-white hover:text-purple-400 group">
                  Explore Events
                  <span className="group-hover:rotate-90 transition duration-300 ease-in-out ml-2">
                    <ExploreLogo />
                  </span>
                </h1>
              </Link>
              <Link
                href="/signin"
                className="text-white bg-white/10 hover:bg-white hover:text-gray-900 font-normal rounded-full text-sm px-3 py-1 transition duration-300 ease-in-out"
              >
                Sign In
              </Link>
            </div>
          </div>
          {/* END Header */}

          {/* Main */}
          <main className="flex items-center justify-center h-5/6">
            <div className="flex flex-col gap-3 w-3/6">
              <h1 className="text-base text-white">ATFI PROJECT</h1>
              <div>
                <h1 className="text-5xl font-medium text-white">Where great events are</h1>
                <h2 className="text-5xl font-medium bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                  brought to life.
                </h2>
              </div>
              <p className="text-white">
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
