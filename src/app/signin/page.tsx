"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function SigninPage() {
  const router = useRouter();
  const { ready, authenticated, user, login, logout } = usePrivy();

  useEffect(() => {
    // Debug: lihat bentuk object user di console sekali setelah ready
    if (ready) console.log("Privy user object:", user);
  }, [ready, user]);

  // Ambil wallet address dengan safe checks (struktur bisa beda-beda)
  const walletAddress =
    user?.wallet?.address ?? // kemungkinan 1
    // user?.wallets?.[0]?.address ?? // kemungkinan 2 (array)
    // user?.walletAddress ?? // kemungkinan 3 (lain-lain)
    null;

  const userId = user?.id ?? null;

  // contoh redirect kalau sudah login
  useEffect(() => {
    if (authenticated) {
      // contoh: redirect ke dashboard setelah login
      // router.push("/dashboard");
      // jangan redirect otomatis saat dev-debug, aktifkan kalau mau UX tersebut
      console.log("User authenticated — you can redirect or show dashboard UI");
    }
  }, [authenticated, router]);

  if (!ready) return <div>Loading Privy...</div>;

  return (
    <div>
      <h1>Signin</h1>

      {!authenticated ? (
        <>
          <p>Pake Privy aja buat make sure nanti</p>
          <button
            onClick={login}
            className="cursor-pointer py-2 px-4 bg-blue-500 text-white rounded"
          >
            Log in
          </button>
        </>
      ) : (
        <>
          <p>Sudah login ✅</p>
          <div>
            <p>User ID: {userId ?? "tidak tersedia"}</p>
            {/* <p>Email: {email ?? "tidak tersedia"}</p> */}
            <p>Wallet: {walletAddress ?? "belum ada wallet terasosiasi"}</p>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => logout()}
              className="cursor-pointer py-2 px-4 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
