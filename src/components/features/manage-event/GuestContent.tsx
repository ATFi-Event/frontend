import { Progress, Badge, Avatar } from "flowbite-react";

export default function GuestContent() {
  const registeredNumber = 2;
  const cap = 10;
  const numberProgress = Math.min(100, (registeredNumber / cap) * 100);

  return (
    <div className="mx-[240px] px-3 mt-5 flex flex-col gap-3">
      {/* Header */}
      <section className="flexx flex-col gap-3">
        <h1 className="text-2xl font-semibold">At a Glance</h1>
        <div className="flex justify-between">
          <p className="text-green-500 font-normal mb-3">
            <span className="text-xl">{registeredNumber}</span> guest
          </p>
          <p className="text-gray-500">
            cap <span className="text-xl">{cap}</span>
          </p>
        </div>
        <div>
          <Progress progress={numberProgress} color="green" />
          <p className="text-green-500 mt-2">
            • {registeredNumber} approve this event
          </p>
        </div>
      </section>

      <hr className="text-gray-700 bg-gray-700" />

      {/* Main */}
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Guest List</h1>
        <div className="w-full">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 ps-10 text-sm text-white border border-gray-500 rounded-lg bg-[#131517]"
              placeholder="Search "
              required
            />
          </div>
        </div>

        {/* Maping Data Register*/}
        <div>
          <div className="flex justify-between items-center p-3  bg-gray-700 rounded-xl border border-gray-600">
            {/* Data User */}
            <div className="flex gap-3 text-sm items-center">
              <Avatar img="" alt="avatar of Jese" rounded size="xs" />
              <h1 className="text-gray-200">Kuro - Name</h1>
              <h2 className="text-gray-400">kuro@example.com - Email</h2>
            </div>
            {/* Data Approve dan Regsitered Time  */}
            <div className="text-base flex gap-2 items-center">
              <Badge color="success">Going</Badge>
              <h1 className="text-gray-400">Yesterday</h1>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
