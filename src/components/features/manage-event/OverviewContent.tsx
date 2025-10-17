import CancelEventOverview from "@/components/organism/CancelEventOverview";
import GuestsEventOverview from "@/components/organism/GuestsEventOverview";
import HostEventOverview from "@/components/organism/HostEventOverview";
import { Avatar, Button, ClipboardWithIcon } from "flowbite-react";
import Image from "next/image";

export default function OverviewContent() {
  return (
    <div className="mx-[240px] px-3 mt-5 mb-10 flex flex-col gap-3">
      {/* Detail Event */}
      <section>
        <h1 className="text-2xl text-gray-200 font-semibold mb-3">
          Detail Event
        </h1>
        <div className="flex justify-between gap-5 rounded-xl bg-gray-800 p-5 min-h-[300px]">
          <div className="w-full flex flex-col justify-between">
            <main>
              <div className="flex gap-3 mb-2">
                <Image
                  src={
                    "https://images.unsplash.com/photo-1663970206579-c157cba7edda"
                  }
                  alt="gambar"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover size-[200px]"
                ></Image>
                <div>
                  <h1 className="text-gray-300 font-semibold text-lg">
                    Testing Event
                  </h1>
                  <p className="text-gray-400 font-normal text-base">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Ducimus vitae quia ratione obcaecati nobis, laboriosam
                    nulla? Eius maiores veritatis, itaque et tenetur ea culpa
                    vitae rem assumenda expedita officia in.
                  </p>
                </div>
              </div>
              <div>
                <h1 className="text-gray-400 text-sm font-normal">Host</h1>
                <div className="flex items-center gap-1 text-sm">
                  <Avatar img="" alt="avatar of Jese" rounded size="xs" />
                  <h1>Kuro</h1>
                </div>
              </div>
            </main>

            <div className="flex items-center justify-between w-full">
              <h1 className="text-gray-300 font-normal text-base">
                Share Link Event
              </h1>
              <div className="max-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full text-sm rounded-lg text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    value="http://event-id.io"
                    disabled
                    readOnly
                  />
                  <ClipboardWithIcon valueToCopy="http://event-id.io" />
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan */}
          <div className="w-full flex flex-col justify-between">
            <div className="w-full flex flex-col gap-2">
              <p className="text-gray-300 font-semibold text-lg">
                When & Where
              </p>
              <div className="flex gap-1">
                <span className="material-symbols-outlined">
                  calendar_today
                </span>
                <div>
                  <p className="text-gray-300 font-normal text-lg">Tommorow</p>
                  <p className="text-gray-400 font-normal text-base">
                    5:30 PM - 8:00 PM GMT+7
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <span className="material-symbols-outlined">location_on</span>
                <div className="">
                  <p className="text-gray-300 font-normal text-lg">Location</p>
                  <p className="text-gray-400 font-normal text-base">
                    Jl. Jend. Sudirman No. 20, Jakarta
                  </p>
                </div>
              </div>
            </div>
            <Button color="light">Edit Event</Button>
          </div>
        </div>
      </section>

      <hr className="text-gray-700 bg-gray-700" />

      {/* Guest Overview */}
      <GuestsEventOverview />

      <hr className="text-gray-700 bg-gray-700" />

      {/* Hosts */}
      <HostEventOverview />

      <hr className="text-gray-700 bg-gray-700" />

      {/* Cancel Event / Delete Event */}
      <CancelEventOverview />
    </div>
  );
}
