"use client";

import { formatTime } from "@/utils/formaterDateAndTime";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, Tooltip, Popover } from "flowbite-react";

export default function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerID);
  }, []);

  return (
    <section className="flex justify-between items-center px-4 py-3 text-base bg-gradient-to-b from-[#14202c] to-[#131517] borer border-b-[#939094]">
      {/* Logo */}
      <h1 className="text-[#939094] font-bold">ATFI</h1>

      {/* <div className="flex items-center text-sm gap-3 w-full"> */}
      <div className="flex gap-3 items-center text-sm text-[#939094] text-semibold">
        <h1 className="flex items-center justify-center gap-1 text-white group text-base transition duration-100">
          <span className="material-symbols-outlined">event</span>
          Event
        </h1>
        <h1 className="flex items-center justify-center gap-1 hover:text-white group text-base transition duration-100 ">
          <span className="material-symbols-outlined ">calendar_today</span>
          Calender
        </h1>
        <h1 className="flex items-center justify-center gap-1 hover:text-white group text-base transition duration-100">
          <span className="material-symbols-outlined">explore</span>
          Discover
        </h1>
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
