"use client";

import { formatTime } from "@/utils/formaterDateAndTime";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { usePrivy } from "@privy-io/react-auth";
import { Avatar, Tooltip } from "flowbite-react";

// Custom Logo Components
const HomeLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const CalendarLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

const DiscoverLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" />
  </svg>
);

const ProfileLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const SettingsLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
  </svg>
);

const MyEventsLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
  </svg>
);

const SearchLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const NotificationsLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const LoginLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
  </svg>
);

const LogoutLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-current"
  >
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

// Backend API interface
interface Profile {
  id: string;
  wallet_address: string;
  name: string;
  email?: string;
  balance: string;
}

// Custom Dropdown Component with React Portal
interface CustomDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  logout: () => Promise<void>;
}

function CustomDropdown({
  isOpen,
  onClose,
  user,
  logout,
}: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch profile data from backend when dropdown opens
  useEffect(() => {
    if (isOpen && user?.wallet?.address) {
      fetchProfileData(user.wallet.address);
    }
  }, [isOpen, user?.wallet?.address]);

  const fetchProfileData = async (walletAddress: string) => {
    if (profileLoading) return;

    setProfileLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/profiles/${walletAddress}`
      );
      if (response.ok) {
        const data: Profile = await response.json();
        setProfileData(data);
      } else {
        console.warn("Profile not found or API error");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 999999,
      }}
    >
      {/* User Info */}
      <div className="border-b border-gray-700 bg-gray-750 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            img={user?.farcaster?.pfp || user?.twitter?.pfp || ""}
            alt="User Avatar"
            rounded
            size="md"
          />
          <div className="flex-1 min-w-0">
            {profileLoading ? (
              <>
                <h3 className="font-semibold text-white">
                  <div className="animate-pulse bg-gray-600 h-5 w-32 rounded mb-2"></div>
                </h3>
                <div className="text-sm text-gray-400">
                  <div className="animate-pulse bg-gray-600 h-4 w-24 rounded mb-1"></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <div className="animate-pulse bg-gray-600 h-3 w-20 rounded"></div>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  <div className="animate-pulse bg-gray-600 h-3 w-full rounded"></div>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-white truncate">
                  {profileData?.name ||
                    user?.farcaster?.displayName ||
                    user?.twitter?.username ||
                    "User"}
                </h3>
                <p className="text-sm text-gray-400 truncate">
                  {profileData?.email || user?.email || "No email"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Balance:{" "}
                  {profileData?.balance || user?.wallet?.balance || "0.00"} USDC
                </p>
                <p className="text-xs text-gray-500 font-mono break-all">
                  {user?.wallet?.address || "No wallet connected"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <ProfileLogo />
          View Profile
        </Link>

        <Link
          href="/setting"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <SettingsLogo />
          Settings
        </Link>

        <Link
          href="/my-events"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <MyEventsLogo />
          My Events
        </Link>

        <hr className="my-2 border-gray-700" />

        <button
          onClick={async () => {
            try {
              await logout();
              window.location.href = "/signin";
            } catch (error) {
              console.error("Logout failed:", error);
              // Fallback to redirect if logout fails
              window.location.href = "/signin";
            }
          }}
          className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors w-full text-left"
        >
          <LogoutLogo />
          Sign Out
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div ref={triggerRef} className="relative">
        <Avatar
          img={user?.farcaster?.pfp || user?.twitter?.pfp || ""}
          alt="User Avatar"
          rounded
          size="sm"
          className="cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
        />
      </div>
      {typeof window !== "undefined" &&
        createPortal(dropdownContent, document.body)}
    </>
  );
}

export default function Navbar({
  active,
  create,
}: {
  active?: string;
  create?: boolean;
}) {
  const { authenticated, user, logout } = usePrivy();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const timerID = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timerID);
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navbarClasses = isScrolled
    ? "bg-gradient-to-b from-[#14202c] to-[#131517] shadow-lg border-b border-gray-600 transition duration-200 ease-out"
    : create
    ? "bg-transparent shadow-none border-b border-transparent"
    : "bg-gradient-to-b from-[#14202c] to-[#131517] border-b border-gray-600";

  return (
    <section
      className={`flex justify-between items-center px-4 py-3 text-base sticky top-0 z-50 scroll-auto ${navbarClasses}`}
    >
      {/* Logo */}
      <Link href="/home" className="flex items-center">
        <h1 className="text-[#939094] font-bold text-xl hover:text-white transition-colors">
          ATFI
        </h1>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/home"
          className={`flex items-center justify-center gap-2 ${
            active === "home" ? "text-white" : "text-[#939094]"
          } hover:text-white group text-base transition duration-100`}
        >
          <HomeLogo />
          <span>Home</span>
        </Link>

        <Link
          href="/calender"
          className={`flex items-center justify-center gap-2 ${
            active === "calender" ? "text-white" : "text-[#939094]"
          } hover:text-white group text-base transition duration-100`}
        >
          <CalendarLogo />
          <span>Calendar</span>
        </Link>

        <Link
          href="/discover"
          className={`flex items-center justify-center gap-2 ${
            active === "discover" ? "text-white" : "text-[#939094]"
          } hover:text-white group text-base transition duration-100`}
        >
          <DiscoverLogo />
          <span>Discover</span>
        </Link>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="hidden sm:block">
          <h1 className="text-[#939094] text-sm">{formatTime(currentTime)}</h1>
        </div>

        {/* Create Events Button */}
        {authenticated && (
          <Link href="/create">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-all text-sm font-medium">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-current"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Create Event
            </button>
          </Link>
        )}

        {/* Search & Notifications */}
        <Tooltip content="Search - Coming Soon" placement="bottom">
          <button className="p-2 text-[#939094] hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <SearchLogo />
          </button>
        </Tooltip>

        {authenticated && (
          <Tooltip content="Notifications - Coming Soon" placement="bottom">
            <button className="p-2 text-[#939094] hover:text-white hover:bg-white/10 rounded-lg transition-all relative">
              <NotificationsLogo />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </Tooltip>
        )}

        {/* User Profile Dropdown */}
        {authenticated && user ? (
          <div onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <CustomDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              user={user}
              logout={logout}
            />
          </div>
        ) : (
          <Link href="/signin">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#939094]/20 hover:bg-[#939094]/30 text-[#939094] hover:text-white rounded-lg transition-all border border-[#939094]/30 text-sm font-medium">
              <LoginLogo />
              Connect
            </button>
          </Link>
        )}
      </div>
    </section>
  );
}
