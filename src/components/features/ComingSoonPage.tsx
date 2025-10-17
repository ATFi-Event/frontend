"use client";

import Link from "next/link";

const ComingSoonPage = () => {
  return (
    // Bagian Utama: Background gelap dengan gradien subtle
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4 antialiased">
      {/* Container Card - Transparan, Efek Kaca (Web3 Aesthetic) */}
      <div
        className="
          bg-gray-800/60 
          backdrop-blur-md 
          p-8 md:p-12 
          rounded-2xl 
          shadow-2xl 
          max-w-4xl 
          w-full 
          border border-gray-700/50 
          transition duration-500 
          hover:border-indigo-500/50 
          text-center
        "
      >
        {/* Header dan Tagline */}
        <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-tight">
          Feature Incoming
        </h1>

        {/* Footer/Social Links Placeholder */}
        <div className="mt-6 text-xl text-gray-500">
          <p>In progress</p>
        </div>

        <Link href="/home">Kembali</Link>
      </div>
    </div>
  );
};

export default ComingSoonPage;
