

import { createClient } from "@/utils/supabase/server";
import { createEventAction } from "./actions/test";
import DeleteTest from "./delete";


export default async function TestRoutePage() {
  const supabase = await createClient();
  const { data: events, error } = await supabase.from("event").select("*");

  // Tampilkan error jika ada
  if (error) return <div>Gagal memuat acara: {error.message}</div>;


  return (
    <div>
      <h1>Test</h1>
      <form action={createEventAction} className="flex flex-col">
        <h2>ADD EVENT - TEST</h2>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          placeholder="title-test"
          className="text-black"
        />
        <br />
        <label htmlFor="desc">Description</label>
        <textarea
          id="desc"
          name="desc"
          placeholder="desc test"
          className="text-black"
        ></textarea>
        <br />
        <input type="submit" value="submit" className="p-3 bg-blue-400" />
      </form>
      <hr />
      <h1>Test nampilin data</h1>
      <p>{JSON.stringify(events, null, 2)}</p>
      <br /> <br />
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.id} - {event.title} - {event.description} - <DeleteTest id={event.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
