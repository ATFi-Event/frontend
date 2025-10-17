import ButtonCustom from "../ui/ButtonCustom";

export default function JudulEvent() {
  return (
    <div className="mx-[240px] pt-10 px-4">
      <p className="flex items-center text-sm text-gray-400 hover:text-pink-400 mb-2">
        Personal
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="12px"
          viewBox="0 -960 960 960"
          width="12px"
          fill="#e3e3e3"
          className="rotate-180"
        >
          <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
        </svg>
      </p>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-4xl font-semibold">Testing Event</h2>
        <ButtonCustom type="arrow" content="Event Page"></ButtonCustom>
      </div>
    </div>
  );
}
