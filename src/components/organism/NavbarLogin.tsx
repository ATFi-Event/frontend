"use client";

import { formatTime } from "@/utils/formaterDateAndTime";

import Image from "next/image";
import { Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";

export default function NavbarLogin() {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerID);
  }, []);

  return (
    <>
      {/* Provider Sudah Login */}
      <section className="stiky top-0 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-5 ">
          <h1 className="text-[#939094] font-bold text-sm">ATFI</h1>

          {/* <div className="flex items-center text-sm gap-3 w-full"> */}
          <div className="flex gap-3 items-center text-sm text-[#939094]">
            <h1 className="flex items-center gap-1">
              {" "}
              <span className="material-symbols-outlined text-[10px]">
                event
              </span>
              Event
            </h1>
            <h1 className="flex items-center gap-1">
              {" "}
              <span className="material-symbols-outlined text-[10px]">
                calendar_today
              </span>
              Calender
            </h1>
            <h1 className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">
                explore
              </span>
              Discover
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <h1 className="text-[#939094] text-sm">
              {formatTime(currentTime)}
            </h1>
            <h1>Create Event</h1>
            <Tooltip content="Search - Next Features" placement="bottom">
              <button
                data-tooltip-target="tooltip-search" // TARGET
                data-tooltip-placement="bottom"
                type="button"
                className="material-symbols-outlined cursor-pointer"
              >
                search
              </button>
            </Tooltip>
            <Tooltip content="Notifications - Next Features" placement="bottom">
              <button
                type="button"
                className="material-symbols-outlined cursor-pointer"
              >
                notifications
              </button>
            </Tooltip>
            <Image
              src="https://plus.unsplash.com/premium_vector-1746235878947-461bb297474f"
              className="rounded-full"
              alt="profile"
              width={24}
              height={24}
            />
          </div>
          {/* </div> */}
        </div>
        {/* END Header */}
      </section>
      {/* Provider Sudah Login */}
    </>
  );
}
