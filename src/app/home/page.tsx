export default function HomePage() {
  return (
    <div>
      <nav class="fixed top-0 z-50 w-full h-16 bg-gray-900 shadow-lg border-b border-gray-800">
        <div class="max-w-[1920px] mx-auto h-full flex items-center justify-between px-4 md:px-8">
          <div class="flex items-center space-x-4">
            <button class="text-gray-400 hover:text-indigo-400 transition">
              Logo Ini
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                Logo ini
              </svg>
            </button>
          </div>

          <div class="hidden md:flex flex-grow justify-center">
            <div class="flex space-x-8 text-gray-300 font-semibold mx-auto">
              <a
                href="#"
                class="flex items-center gap-2 px-3 py-2 border-b-2 border-indigo-500 text-indigo-400 transition duration-150"
              >
                Events
              </a>
              <a
                href="#"
                class="flex items-center gap-2 px-3 py-2 hover:text-gray-100 transition duration-150"
              >
                Calendars
              </a>
              <a
                href="#"
                class="flex items-center gap-2 px-3 py-2 hover:text-gray-100 transition duration-150"
              >
                Discover
              </a>
            </div>
          </div>

          <div class="flex items-center space-x-4 text-sm">
            <span class="text-gray-400 hidden sm:inline">4:17 PM GMT+7</span>
            <button class="p-1 rounded-full text-gray-400 hover:text-white transition">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                ...
              </svg>
            </button>
            <div class="w-8 h-8 rounded-full bg-pink-500/80 border-2 border-pink-400 cursor-pointer"></div>
          </div>
        </div>
      </nav>
      <h1>Home</h1>
      <p>Isinya event yang dimiliki</p>
    </div>
  );
}
