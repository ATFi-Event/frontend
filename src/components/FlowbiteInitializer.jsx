// components/FlowbiteInitializer.jsx
"use client";
// ^ Memberi tahu Next.js bahwa ini adalah komponen klien

import { useEffect } from 'react';

export default function FlowbiteInitializer() {
  useEffect(() => {
    // Import dan Inisialisasi Flowbite secara dinamis setelah komponen ter-mount
    // Ini menghindari masalah SSR (Server-Side Rendering)
    const initFlowbite = async () => {
      try {
        const { initFlowbite } = await import('flowbite');
        initFlowbite();
      } catch (error) {
        console.error("Gagal menginisialisasi Flowbite:", error);
      }
    };

    initFlowbite();

  }, []);

  return null; // Komponen ini hanya untuk logic, tidak merender apa-apa
}