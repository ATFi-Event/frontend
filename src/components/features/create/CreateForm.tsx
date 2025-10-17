"use client";

import Image from "next/image";
import CounterNumber from "./CounterNumber";
import { Popover } from "flowbite-react";
import { useState } from "react";
import React from "react"; // Tambahkan import React
import Navbar from "@/components/organism/Navbar";

interface GmtOption {
  offset: string;
  city: string;
  value: number;
}

const gmtOptions: Record<number, GmtOption> = {
  0: { offset: "GMT+07:00", city: "Jakarta", value: 0 },
  1: { offset: "GMT+08:00", city: "Tokyo", value: 1 },
  2: { offset: "GMT+09:00", city: "Seoul", value: 2 },
};

const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
const todayFormatted = formatDateTimeLocal(new Date());

export default function CreateForm() {
  // =================================================================
  // title, description, location (Handlers sudah OK)
  // =================================================================
  const [title, setTitle] = useState("");
  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const [description, setDescription] = useState("");
  const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const [location, setLocation] = useState("");
  const handleLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  // =================================================================
  // GMT OPTIONS - PERBAIKAN
  // =================================================================
  const [selectedGmt, setSelectedGmt] = useState(gmtOptions[0]);
  const [isGmtPopoverOpen, setIsGmtPopoverOpen] = useState(false); // Ganti nama state untuk menghindari konflik

  const handleGmtChange = (optionKey: number) => {
    const newGmt = gmtOptions[optionKey];
    setSelectedGmt(newGmt);
    setIsGmtPopoverOpen(false); // Tutup popover setelah memilih
  };

  // =================================================================
  // HANDLERS UNTUK TANGGAL (datetime-local)
  // =================================================================
  const [startDate, setStartDate] = useState(""); // Gunakan string kosong
  const [endDate, setEndDate] = useState("");
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  React.useEffect(() => {
    const today = new Date(Date.now());
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);

    // Hanya atur state jika belum diatur (misalnya, jika masih string kosong)
    if (!startDate) {
      setStartDate(formatDateTimeLocal(today));
      setEndDate(formatDateTimeLocal(oneHourLater));
    }
  }, []);

  // =================================================================
  // Capacity (Handler sudah OK)
  // =================================================================
  const [capacity, setCapacity] = useState(0);
  const handleCapacityChange = (newCapacity: number) => {
    setCapacity(newCapacity);
  };

  // =================================================================
  // Approval state (Handler sudah OK)
  // =================================================================
  const [isApproved, setIsApproved] = useState(false);
  const handleApprovalChange = () => setIsApproved((prev) => !prev);

  // =================================================================
  // File (Handlers sudah OK)
  // =================================================================
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const fileUrl = URL.createObjectURL(file);
      setImagePreviewUrl(fileUrl);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  // =================================================================
  // Public or Private - PERBAIKAN
  // =================================================================
  const [isPublic, setIsPublic] = useState(true);
  const [isPublicPopoverOpen, setIsPublicPopoverOpen] = useState(false); // State baru untuk popover public/private

  const handleSetPublic = (isPublicSelection: boolean) => {
    setIsPublic(isPublicSelection);
    setIsPublicPopoverOpen(false); // Tutup popover setelah memilih
  };

  // =================================================================
  // Data yang dikumpulkan
  // =================================================================
  const formData: Record<string, string> = {
    title,
    description,
    location,
    start_date: startDate,
    end_date: endDate, // Perbaikan key name dari start_end menjadi end_date
    gmt: selectedGmt.offset,
    approval: isApproved ? "true" : "false",
    capacity: capacity.toString(),
    isPublic: isPublic ? "public" : "private",
  };

  console.log(formData);

  return (
    <>
      <section className="min-h-screen p-3 bg-gradient-to-br from-[#003251] to-[#003251]">
        {/* NAVBAR */}
        <Navbar active="none" create={true} />
        {/* END NAVBAR */}

        {/* MAIN FORM */}
        <main className="mt-10 mx-auto flex gap-5 w-3/4">
          {/* SISI KIRI (Dropzone) */}
          <div className="flex justify-center size-[300px] w-1/2">
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
      ${
        imagePreviewUrl
          ? "border-transparent bg-gray-900"
          : "border-gray-300 bg-gray-700 hover:bg-gray-800"
      }`}
            >
              {imagePreviewUrl ? (
                <Image
                  src={imagePreviewUrl}
                  alt="Preview Event Image"
                  width={300}
                  height={300}
                  className="object-cover w-full h-full rounded-lg"
                />
              ) : (
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          {/* SISI KANAN */}
          <div className="w-full">
            <form action="" className="w-full flex flex-col gap-5">
              {/* Event Type & Visibility - PERBAIKAN POPVER PUBLIC/PRIVATE */}
              <div className="flex justify-between items-center">
                <div className="flex px-3 py-1 bg-gray-700 rounded-full text-[12px]  justify-center items-center gap-2 cursor-pointer">
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

                {/* POPVER PUBLIC/PRIVATE */}
                <Popover
                  open={isPublicPopoverOpen} // Gunakan state public popover
                  onOpenChange={setIsPublicPopoverOpen}
                  content={
                    <div className="w-50 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col text-start">
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium text-left"
                          onClick={() => handleSetPublic(true)}
                        >
                          Public
                        </button>
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium text-left"
                          onClick={() => handleSetPublic(false)}
                        >
                          Private
                        </button>
                      </div>
                    </div>
                  }
                  placement="bottom"
                >
                  <div
                    className="flex px-3 py-1 bg-gray-700 rounded-full text-[12px]  justify-center items-center gap-2 cursor-pointer"
                    onClick={() => setIsPublicPopoverOpen(!isPublicPopoverOpen)} // Toggle popover
                  >
                    <span className="material-symbols-outlined">language</span>
                    {isPublic ? <h1>Public Event</h1> : <h1>Private Event</h1>}
                  </div>
                </Popover>
              </div>

              {/* Event Name */}
              <input
                type="text"
                placeholder="Event Name"
                className="w-full p-0 text-2xl border-0 ring-transparent bg-transparent "
                onChange={(e) => handleTitle(e)}
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
                        min={todayFormatted}
                        value={startDate}
                        onChange={handleStartDateChange}
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
                        min={todayFormatted}
                        value={endDate}
                        onChange={handleEndDateChange}
                      />
                    </div>
                  </div>
                </div>

                {/* GMT - PERBAIKAN POPVER GMT */}
                <Popover
                  aria-labelledby="default-popover"
                  open={isGmtPopoverOpen} // Gunakan state GMT popover
                  onOpenChange={setIsGmtPopoverOpen}
                  arrow={false}
                  content={
                    <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
                      <div className="border-b px-3 py-2 border-gray-600 bg-gray-700">
                        <h3
                          id="default-popover"
                          className="font-semibold text-gray-900 dark:text-white"
                        >
                          GMT Choice
                        </h3>
                      </div>
                      <div className="flex flex-col text-start">
                        {Object.values(gmtOptions).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium text-left"
                            onClick={() => handleGmtChange(option.value)}
                          >
                            {option.offset} - {option.city}
                          </button>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <div
                    className="flex flex-col gap-3 w-1/4 bg-gray-700 rounded-lg px-3 py-2 text-sm h-full cursor-pointer"
                    onClick={() => setIsGmtPopoverOpen(!isGmtPopoverOpen)} // Toggle popover
                  >
                    <span className="material-symbols-outlined text-xs">
                      language
                    </span>
                    <p>{selectedGmt.offset}</p>
                    <p>{selectedGmt.city}</p>
                  </div>
                </Popover>
              </div>

              {/* Event Location */}
              <div className="relative">
                <input
                  type="text"
                  id="floating_filled"
                  className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-700  border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:text-white focus:outline-none focus:ring-0 focus:text-white peer"
                  placeholder=" "
                  onChange={(e) => handleLocation(e)}
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
                  className="block p-2.5 w-full text-sm text-white bg-gray-700 rounded-lg "
                  placeholder="Add Description"
                  onChange={(event) => handleDescription(event)}
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
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={isApproved}
                        onChange={handleApprovalChange}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600 dark:peer-checked:bg-gray-800"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>Capacity</div>
                    <div className="flex items-center">
                      <CounterNumber onCapacityChange={handleCapacityChange} />
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
