"use client";

import { formatTime } from "@/utils/formaterDateAndTime";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, Tooltip, Popover } from "flowbite-react";

export default function Navbar({
  active,
  create,
}: {
  active?: string;
  create?: boolean;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerID);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // --- LOGIKA STYLING YANG DIPERBAIKI ---
  const navbarClasses = isScrolled
    ? // Kondisi 1: Jika scrolled, selalu gunakan styling shadow dan border gelap
      "bg-gradient-to-b from-[#14202c] to-[#131517] shadow-md border-b border-gray-600 transition duration-200 ease-out"
    : create
    ? // Kondisi 2: Jika create=true dan TIDAK scrolled, transparan
      "bg-transparent shadow-none border-b border-transparent" // border-transparent adalah kunci
    : // Kondisi 3: Default (bukan create, tidak scrolled)
      "bg-gradient-to-b from-[#14202c] to-[#131517] border-b border-[#131517]";

  return (
    <section
      className={`flex justify-between items-center px-4 py-3 text-base sticky top-0 z-10 scroll-auto ${navbarClasses}`}
    >
      {/* Logo */}
      <h1 className="text-[#939094] font-bold">ATFI</h1>

      {/* <div className="flex items-center text-sm gap-3 w-full"> */}
      <div className="flex gap-3 items-center text-sm text-[#939094] text-semibold">
        <Link
          href="/home"
          className={`flex items-center justify-center gap-1 ${
            active == "event" ? "text-white" : ""
          } hover:text-white group text-base transition duration-100`}
        >
          <span className="material-symbols-outlined">event</span>
          Event
        </Link>
        <Link
          href="/calender"
          className={`flex items-center justify-center gap-1 ${
            active == "calender" ? "text-white" : ""
          } hover:text-white group text-base transition duration-100`}
        >
          <span className="material-symbols-outlined ">calendar_today</span>
          Calender
        </Link>
        <Link
          href="/discover"
          className={`flex items-center justify-center gap-1 ${
            active == "discover" ? "text-white" : ""
          } hover:text-white group text-base transition duration-100`}
        >
          <span className="material-symbols-outlined">explore</span>
          Discover
        </Link>
      </div>

      {/* Bagian Kanan */}
      <div className="flex gap-5 justify-center items-center me-2">
        <h1 className="text-[#939094]">{formatTime(currentTime)}</h1>
        <Link href="/create">
          <h1 className="flex justify-center items-center text-white cursor-pointer ">
            Create Events
          </h1>
        </Link>
        <Tooltip content="Search - Next Feature" placement="bottom">
          <span className="material-symbols-outlined text-[#939094] hover:text-white cursor-pointer">
            search
          </span>
        </Tooltip>
        <Tooltip content="Notif - Next Feature" placement="bottom">
          <span className="material-symbols-outlined text-[#939094] hover:text-white cursor-pointer">
            notifications
          </span>
        </Tooltip>
        <Popover
          aria-labelledby="default-popover"
          content={
            <div className="w-64 text-sm text-gray-500">
              <div className="border-b bg-gray-700 px-3 py-2">
                <div className="flex gap-3 items-center">
                  <Avatar img="" alt="avatar of Jese" rounded size="md" />
                  <div>
                    <h1 className="font-semibold text-white">Kuro</h1>
                    <h1 className="font-semibold text-gray-500">
                      kuro@example.com
                    </h1>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 w-full flex flex-col justify-center">
                <Link
                  href={"/profile"}
                  className="w-full py-2 px-2 hover:bg-gray-500 text-white hover:text-gray-100 rounded"
                >
                  View Profile
                </Link>
                <Link
                  href={"/setting"}
                  className="w-full py-2 px-2 hover:bg-gray-500 text-white hover:text-gray-100 rounded"
                >
                  Setting
                </Link>
                <Link
                  href={"/login"}
                  className="w-full py-2 px-2 hover:bg-gray-500 text-white hover:text-gray-100 rounded"
                >
                  Logout
                </Link>
              </div>
            </div>
          }
        >
          <Avatar img="" alt="avatar of Jese" rounded size="sm" />
        </Popover>
      </div>
    </section>
  );
}
