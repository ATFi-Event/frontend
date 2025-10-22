"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ManageContent({ path }: { path: string }) {
  const params = useParams();
  const slug = params.slug;
  const basePath = `/event/manage/${slug}`;

  const tabs = [
    {
      name: "Overview",
      href: `${basePath}/overview`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "Guests",
      href: `${basePath}/guests`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
        {/* Navigation Tabs */}
        <div className="mb-8">
        <nav className="flex space-x-1 bg-white/5 backdrop-blur-lg rounded-xl p-1 border border-white/10">
          {tabs.map((tab) => {
            const isActive = path === tab.name.toLowerCase().replace("s", "");

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            );
          })}
        </nav>
        </div>
      </div>
  );
}
