export default function CancelEventOverview() {
  return (
    <section>
      <div className="mb-3">
        <h1 className="text-2xl text-gray-200 font-semibold">Cancel Event</h1>
        <p className="text-base text-gray-300 leading-normal">
          Cancel and permanently delete this event. This operation cannot be
          undone. If there are any registered guests, we will notify them that
          the event has been canceled.
        </p>
      </div>
      <button
        type="button"
        className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center inline-flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20px"
          viewBox="0 -960 960 960"
          width="20px"
          fill="#e3e3e3"
        >
          <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
        </svg>
        Cancel Event
      </button>
    </section>
  );
}
