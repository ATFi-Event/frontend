"use client";

import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  return (
    <>
      <h1>Create Page</h1>
      <div className="min-h-screen bg-[#4B0C1B] text-white flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-4xl bg-[#5A1124] rounded-2xl p-8 shadow-lg space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold">Create Event</h1>
            <button
              type="button"
              className="text-white bg-[#702040] hover:bg-[#833050] focus:ring-4 focus:outline-none focus:ring-[#944060] font-medium rounded-lg text-sm px-4 py-2"
            >
              Public
            </button>
          </div>

          {/* Image and Theme */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/3">
              <img
                src="/event-cover.jpg"
                alt="Event Cover"
                className="rounded-xl object-cover w-full h-48"
              />
              <button className="absolute bottom-3 right-3 bg-white/70 rounded-full p-2">
                ✎
              </button>
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-300">Theme</label>
              <div className="bg-[#6B1832] p-3 rounded-xl mt-2 flex items-center justify-between">
                <span>🎨 Minimal</span>
              </div>
            </div>
          </div>

          {/* Event Name */}
          <div>
            <label
              htmlFor="eventName"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Event Name
            </label>
            <input
              type="text"
              id="eventName"
              placeholder="Enter event name"
              className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg focus:ring-[#944060] focus:border-[#944060] block w-full p-2.5"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Start
              </label>
              <input
                type="datetime-local"
                className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg focus:ring-[#944060] focus:border-[#944060] block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                End
              </label>
              <input
                type="datetime-local"
                className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg focus:ring-[#944060] focus:border-[#944060] block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Timezone
              </label>
              <input
                type="text"
                value="GMT+07:00 Jakarta"
                readOnly
                className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg block w-full p-2.5"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Add Event Location
            </label>
            <input
              id="location"
              placeholder="Offline location or virtual link"
              className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg focus:ring-[#944060] focus:border-[#944060] block w-full p-2.5"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Add Description
            </label>
            <textarea
              id="description"
              placeholder="Enter event details..."
              className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg focus:ring-[#944060] focus:border-[#944060] block w-full p-2.5 h-24 resize-none"
            />
          </div>

          {/* Event Options */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Event Options</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Tickets
                </label>
                <input
                  type="text"
                  value="Free"
                  readOnly
                  className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg block w-full p-2.5"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Require Approval
                </label>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-500 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#944060] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#944060]"></div>
                </label>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Capacity
                </label>
                <input
                  type="text"
                  value="Unlimited"
                  readOnly
                  className="bg-[#6B1832] border border-transparent text-white text-sm rounded-lg block w-full p-2.5"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full text-[#4B0C1B] bg-white hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-400 font-semibold rounded-lg text-base px-5 py-3 text-center"
            >
              Create Event
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
