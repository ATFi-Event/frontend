"use client";

import Image from "next/image";
import CounterNumber from "./CounterNumber";
import { Popover } from "flowbite-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/organism/Navbar";
import { usePrivy } from "@privy-io/react-auth";

// Custom SVG Icons
const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13h2c0 0 7-7.75 7-13 0-3.87-3.13-7-7-7z"/>
  </svg>
);

const NotesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM16 18H8V4h6v6h2V8z"/>
  </svg>
);

const LanguageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-current">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-1.63c-.25 0-.46-.18-.46-.41 0-.24.19-.42.43-.42h-1.19c-.24 0-.43.19-.43.42 0-.23.19-.41.42-.41h1.63c.26 0 .46.19.46.42 0 .23-.2.41-.43.41zm-6.18 0h-1.63c-.25 0-.46-.18-.46-.41 0-.24.19-.42.43-.42H8.71c-.24 0-.43.19-.43.42 0-.23.19-.41.42-.41h1.63c.26 0 .46.19.46.42 0 .23-.2.41-.43.41zm-6.18 3.04h-1.63c-.25 0-.46-.18-.46-.41 0-.24.19-.42.43-.42H8.71c-.24 0-.43.19-.43.42 0-.23.19-.41.42-.41h1.63c.26 0 .46.19.46.42 0 .23-.2.41-.43.41zm6.18 0h-1.63c-.25 0-.46-.18-.46-.41 0-.24.19-.42.43-.42h-1.19c-.24 0-.43.19-.43.42 0-.23.19-.41.42-.41h1.63c.26 0 .46.19.46.42 0 .23-.2.41-.43.41z"/>
  </svg>
);

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
  const { authenticated, user } = usePrivy();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [eventId, setEventId] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stakeAmount, setStakeAmount] = useState("1"); // Default 1 USDC
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Additional states for popovers and form options
  const [isPublic, setIsPublic] = useState(true);
  const [isPublicPopoverOpen, setIsPublicPopoverOpen] = useState(false);
  const [isGmtPopoverOpen, setIsGmtPopoverOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedGmt, setSelectedGmt] = useState({ offset: "GMT+7", city: "Jakarta" });
  const [isApproved, setIsApproved] = useState(false);
  const [location, setLocation] = useState("");

  // GMT options for popover
  const gmtOptions = {
    "GMT+0": { value: "GMT+0", offset: "GMT+0", city: "London" },
    "GMT+7": { value: "GMT+7", offset: "GMT+7", city: "Jakarta" },
    "GMT+8": { value: "GMT+8", offset: "GMT+8", city: "Singapore" },
    "GMT-5": { value: "GMT-5", offset: "GMT-5", city: "New York" },
  };

  // Initialize dates
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week

    const registrationDeadlineFormatted = formatDateTimeLocal(tomorrow);
    const eventDateFormatted = formatDateTimeLocal(nextWeek);

    setRegistrationDeadline(registrationDeadlineFormatted);
    setEventDate(eventDateFormatted);
    setStartDate(registrationDeadlineFormatted);
    setEndDate(eventDateFormatted);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const fileUrl = URL.createObjectURL(file);
      setImagePreviewUrl(fileUrl);

      // For now, just store a placeholder URL
      // In a real app, you'd upload this to a service
      setImageUrl(`/api/placeholder-image/${file.name}`);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  // Handler functions for form inputs
  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setRegistrationDeadline(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setEventDate(e.target.value);
  };

  const handleSetPublic = (publicValue: boolean) => {
    setIsPublic(publicValue);
    setIsPublicPopoverOpen(false);
  };

  const handleGmtChange = (gmtKey: string) => {
    setSelectedGmt(gmtOptions[gmtKey as keyof typeof gmtOptions]);
    setIsGmtPopoverOpen(false);
  };

  const handleApprovalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsApproved(e.target.checked);
  };

  const handleCapacityChange = (capacity: number) => {
    setMaxParticipants(capacity);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated) {
      setError("Please connect your wallet first");
      return;
    }

    if (!title.trim()) {
      setError("Event title is required");
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError("Stake amount must be greater than 0");
      return;
    }

    if (!location.trim()) {
      setError("Event location is required");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert dates to timestamps (in seconds)
      const registrationDeadlineTimestamp = Math.floor(new Date(registrationDeadline).getTime() / 1000);
      const eventDateTimestamp = Math.floor(new Date(eventDate).getTime() / 1000);
      const stakeAmountWei = (parseFloat(stakeAmount) * 1000000).toString(); // Convert USDC to wei (6 decimals)

      // Call smart contract with 4 parameters as requested
      const contractData = {
        stakeAmount: stakeAmountWei,
        registrationDeadline: registrationDeadlineTimestamp,
        eventDate: eventDateTimestamp,
        maxParticipant: maxParticipants
      };

      // For now, simulate the smart contract call
      // In a real app, you'd use ethers.js or web3.js to call the contract
      console.log("Calling smart contract with:", contractData);

      // Simulate successful contract call returning event ID
      const newEventId = Math.floor(Math.random() * 1000) + 1; // Mock event ID
      setEventId(newEventId);

      // Prepare off-chain data for backend API
      const offChainData = {
        event_id: newEventId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        image_url: imageUrl || null,
        is_public: isPublic,
        require_approval: isApproved,
        organizer_address: user?.wallet?.address || "",
      };

      // Call backend POST /api/v1/events endpoint
      const response = await fetch('http://localhost:8080/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offChainData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Event created successfully:", result);
        setSuccess(true);
        setEventId(newEventId);

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = `/event/${newEventId}`;
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <section className="min-h-screen p-3 bg-gradient-to-br from-[#003251] to-[#003251]">
        {/* NAVBAR */}
        <Navbar active="none" create={true} />
        {/* END NAVBAR */}

        {/* Error and Success Messages */}
          {error && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                <p className="font-medium">Error: {error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
                <p className="font-medium">Event created successfully! Redirecting to event page...</p>
                <p className="text-sm">Event ID: {eventId}</p>
              </div>
            </div>
          )}

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
              <form onSubmit={handleCreateEvent} className="w-full flex flex-col gap-5">
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

              {/* Stake Amount */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="stake-amount"
                  className="text-sm font-medium text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">payments</span>
                    Stake Amount (USDC)
                  </div>
                </label>
                <input
                  type="number"
                  id="stake-amount"
                  className="block p-2.5 w-full text-sm text-white bg-gray-700 rounded-lg"
                  placeholder="Enter stake amount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <p className="text-xs text-gray-500">Participants must stake this amount to join the event</p>
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
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center transition-all ${
                    isCreating
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "text-gray-900 bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Event...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </button>
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
