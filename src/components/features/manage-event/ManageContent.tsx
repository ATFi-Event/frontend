"use client";

import JudulEvent from "@/components/organism/JudulEvent";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ManageContent({ path }: { path: string }) {
  const params = useParams();
  const slug = params.slug;
  const basePath = `/event/manage/${slug}`;

  return (
    <div>
      {/* Bagian Atas */}
      <nav>
        {/* Judul Event */}
        <JudulEvent></JudulEvent>
        {/* Tabs */}
        <div className="border-b border-gray-700 flex ">
          <div
            className={`flex space-x-6 px-4 ${
              path == "overview" ? "mx-[160px]" : ""
            } mx-[240px]`}
          >
            <Link
              href={`${basePath}/overview`}
              className={`
                py-3 
                ${path === "overview" ? "text-white" : "text-gray-600"}
                font-semibold 
                border-b-2 
                hover:text-white             
                ${path === "overview" ? "border-white " : "border-transparent"}
                `}
            >
              Overview
            </Link>
            <Link
              href={`${basePath}/guests`}
              className={`
                py-3 
               ${path === "guests" ? "text-white" : "text-gray-600"}
                font-semibold 
                hover:text-white        
                border-b-2 
              ${path === "guests" ? "border-white " : "border-transparent"}
                `}
            >
              Guest
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
