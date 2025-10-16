"use client";

import LandingPage from "@/components/features/landing_page/LandingPage";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react"; // Tambahkan import useEffect

export default function Home() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  // Logika Redirect diletakkan di dalam useEffect
  useEffect(() => {
    // 1. Pastikan Privy sudah selesai inisialisasi status auth
    if (ready) {
      // 2. Jika SUDAH login (authenticated: true), redirect ke /home
      if (authenticated) {
        // Menggunakan replace untuk UX yang bersih, tidak bisa Back ke halaman ini
        router.replace("/home");
      }
      // 3. Jika BELUM login (authenticated: false), biarkan kode selesai
      //    dan LandingPage akan ditampilkan di bagian return.
    }
  }, [ready, authenticated, router]);

  // --- Penanganan Belum Login ---
  // Jika ready=true dan authenticated=false, tampilkan LandingPage
  return (
    <>
      <LandingPage />
    </>
  );
}
