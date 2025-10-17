"use client";

import Navbar from "@/components/organism/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="min-h-screen">
        {/* Navbar */}
        <Navbar active="event" />

        {/* Main */}
        <div>
          {/* Mapping dalam ini */}
          <div className="mx-[245px] mt-5">
            <div className="pt-11 flex justify-between mb-10">
              <h1 className="text-3xl text-white font-semibold">Events</h1>
              <div className="p-1 bg-gray-700 rounded-lg flex gap-1">
                <button className="px-2 py-2 w-[100px] bg-gray-500 text-white rounded-lg">
                  Upcoming
                </button>
                <button className="px-2 py-2 w-[100px] bg-gray-700  text-gray-400 hover:text-white rounded-l transition delay-100">
                  Past
                </button>
              </div>
            </div>
            {/* Bagian Cardnya  */}
            <div className="flex">
              <div className="w-1/4">
                <h1 className="text-xl text-white">Oct 18</h1>
                <h1 className="text-md text-gray-300">Saturday</h1>
              </div>
              <div className="w-3/4 p-3 bg-gray-700 rounded-lg border border-gray-700 hover:border-gray-500 transition delay-100 ease-out">
                <div className="flex justify-between mb-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-gray-400">5:30 AM</p>
                    <h1 className="text-white text-2xl">Testing Event</h1>
                    <h1 className="text-yellow-300">! Location / Zoom</h1>
                    <h2 className="text-gray-400">No Guest</h2>
                  </div>
                  <Image
                    src="https://plus.unsplash.com/premium_vector-1746235878947-461bb297474f"
                    alt="gambar"
                    width={40}
                    height={40}
                    className="w-30 h-30 rounded-lg"
                  ></Image>
                </div>
                <Link href="event/manage/ev-123">
                  <button className="flex items-center gap-1 bg-gray-400 text-gray-200 rounded-lg px-3 py-2 hover:bg-gray-500 hover:text-gray-200 transition delay-100 ease-in-out">
                    Manage Event{" "}
                    <span className="material-symbols-outlined">
                      arrow_right_alt
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {/*END - Mapping dalam ini */}
        </div>
      </section>
    </>
  );
}
