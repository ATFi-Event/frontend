// components/DeleteTest.tsx
"use client"; // WAJIB: Karena ada onClick dan state

import { useState } from "react";
import { deleteEventAction } from "./actions/test";

// Tentukan tipe props
interface DeleteTestProps {
  id: string; // Menerima ID (UUID) sebagai string
}

export default function DeleteTest({ id }: DeleteTestProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    // Panggil Server Action dengan ID yang diterima dari props
    await deleteEventAction(id);

    // Tidak perlu router.refresh() karena Server Action sudah memanggil revalidatePath('/')
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded disabled:bg-gray-400 transition duration-150 ml-4"
    >
      {isLoading ? "Menghapus..." : "Hapus"}
    </button>
  );
}
