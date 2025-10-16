// actions/event.ts
"use server";

// import { cookies } from "next/headers";
import { revalidatePath } from "next/cache"; // Untuk refresh data
import { createClient } from "@/utils/supabase/server";

// C - CREATE
export async function createEventAction(formData: FormData) {
  // const cookieStore = cookies();
  const supabase = await createClient();

  console.log(formData);

  const title = formData.get("title") as string;
  const description = formData.get("desc") as string;

  const { error } = await supabase.from("event").insert({ title, description });

  if (error) console.error(error);

  // Setelah data diubah, refresh halaman root agar READ terbaru
  revalidatePath("/test");
}

// D - DELETE
export async function deleteEventAction(id: string) {
  // const cookieStore = cookies();
  const supabase = await createClient();

  const { error } = await supabase.from("event").delete().eq("id", id);

  if (error) console.error(error);

  // Setelah data diubah, refresh halaman root agar READ terbaru
  revalidatePath("/test");
}
