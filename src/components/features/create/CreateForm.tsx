"use client";

import Image from "next/image";
import NavbarLogin from "../../organism/NavbarLogin";
import CounterNumber from "./CounterNumber";

export default function CreateForm() {
  return (
    <>
      <section className="min-h-screen p-3 bg-gradient-to-br from-[#003251] to-[#003251]">
        {/* NAVBAR */}
        <NavbarLogin />
        {/* END NAVBAR */}

        {/* MAIN FORM */}
        <main className="mt-10 mx-auto flex gap-5 w-3/4">
          {/* SISI KIRI */}
          <div className="flex justify-center size-[300px] w-1/2">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 "
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" />
            </label>
          </div>
          {/* SISI KANAN */}
          <div className="w-full">
            <form action="" className="w-full flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div className="flex px-3 py-1 bg-gray-700 rounded-full text-[12px]  justify-center items-center gap-2 cursor-pointer">
                  <Image
                    src="https://plus.unsplash.com/premium_vector-1746235878947-461bb297474f"
                    className="rounded-full"
                    alt="profile"
                    width={20}
                    height={20}
                  />
                  <h1>Personal Event</h1>
                  <span className="material-symbols-outlined">
                    keyboard_arrow_down
                  </span>
                </div>
                <div className="flex px-3 py-1 bg-gray-700 rounded-full text-[12px]  justify-center items-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined">language</span>
                  <h1>Public Event</h1>
                </div>
              </div>

              {/* Event Name */}
              <input
                type="text"
                placeholder="Event Name"
                className="w-full p-0 text-2xl border-0 ring-transparent bg-transparent "
              />
              {/* Event Date */}
              <div className="flex gap-3 w-full items-center h-[100px] ">
                <div className="flex flex-col gap-1 w-full bg-gray-700 rounded-lg px-3 py-2 text-sm h-full">
                  <div className="flex justify-between items-center">
                    <h1>Start</h1>
                    <div className="flex gap-0.5">
                      <input
                        type="datetime-local"
                        name="start-date-time"
                        id=""
                        className="bg-transparent rounded-xl w-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h1>End</h1>
                    <div className="flex gap-0.5">
                      <input
                        type="datetime-local"
                        name="end-date-time"
                        id=""
                        className="bg-transparent rounded-xl w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-1/4 bg-gray-700 rounded-lg px-3 py-2 text-sm h-full">
                  <span className="material-symbols-outlined text-xs">
                    language
                  </span>
                  <p>GMT+07:00</p>
                  <p>Jakarta</p>
                </div>
              </div>

              {/* Event Location */}
              <div className="relative">
                <input
                  type="text"
                  id="floating_filled"
                  className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-700  border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:text-white focus:outline-none focus:ring-0 focus:text-white peer"
                  placeholder=" "
                />
                <label
                  htmlFor="floating_filled"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-5 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                  <div className="flex items-center justify-center">
                    <span className="material-symbols-outlined">
                      location_on
                    </span>
                    Location Event
                  </div>
                </label>
              </div>

              {/* Event Description */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="Description"
                  className="text-sm font-medium text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">notes</span>
                    Event Description
                  </div>
                </label>
                <textarea
                  id="Description"
                  className="block p-2.5 pt-5 w-full text-sm text-white bg-gray-700 rounded-lg "
                  placeholder="Add Description"
                ></textarea>
              </div>

              {/* Event Option */}
              <div>
                <h1>Event Option</h1>
                <section className="bg-gray-700 p-2.5 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label htmlFor="approval">Require Approval</label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id="approval"
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300  rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-gray-500">
                        {" "}
                      </div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>Capacity</div>
                    <div className="flex items-center">
                      <CounterNumber />
                    </div>
                  </div>
                </section>
              </div>

              {/* Button Submit */}
              <div className="w-full">
                <input
                  type="submit"
                  className="text-gray-900 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 w-full"
                  value={"Create Event"}
                />
              </div>

              {/* END FORM */}
            </form>
          </div>
        </main>
        {/* END - MAIN FORM */}
      </section>
    </>
  );
}
