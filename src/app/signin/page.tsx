"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function SigninRoutePage() {
  const router = useRouter();
  const { ready, authenticated, user, login } = usePrivy();
  const hasTriggeredLogin = useRef(false); // ⛔️ flag supaya login() gak dipanggil terus
  const hasCheckedProfile = useRef(false); // ⛔️ flag supaya checkProfile() gak dipanggil berkali-kali
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (ready) console.log("Privy user object:", user);
  }, [ready, user]);

  const walletAddress = user?.wallet?.address ?? null;
  const userId = user?.id ?? null;
  const userEmail = user?.email?.address ?? null;

  // 🚀 Auto-login saat halaman dibuka
  useEffect(() => {
    if (ready && !authenticated && !hasTriggeredLogin.current) {
      hasTriggeredLogin.current = true; // tandai sudah login
      login(); // panggil login otomatis
    }
  }, [ready, authenticated, login]);

  // 🔍 Check profile when authenticated
  useEffect(() => {
    if (
      authenticated &&
      walletAddress &&
      !hasCheckedProfile.current &&
      !isCheckingProfile
    ) {
      hasCheckedProfile.current = true; // tandai sudah check profile
      checkProfile();
    }
  }, [authenticated, walletAddress, isCheckingProfile]);

  const checkProfile = async () => {
    if (!walletAddress) return;

    setIsCheckingProfile(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/profiles/${walletAddress}`
      );

      if (response.status === 404) {
        // Profile doesn't exist, show modal to create one
        setShowProfileModal(true);
      } else if (response.ok) {
        // Profile exists, proceed to home
        router.push("/home");
        console.log("Profile exists — redirecting to /home");
      } else {
        // For any server error (500, etc.), show the modal to create profile
        console.error(
          "Profile check failed:",
          response.status,
          "Showing profile creation modal"
        );
        setShowProfileModal(true);
      }
    } catch (error) {
      // For network errors, also show the modal to create profile
      console.error(
        "Profile check error:",
        error,
        "Showing profile creation modal"
      );
      setShowProfileModal(true);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const createProfile = async () => {
    if (!walletAddress || !profileName.trim()) {
      setProfileError("Name is required");
      return;
    }

    setIsCreatingProfile(true);
    setProfileError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            name: profileName.trim(),
            email: userEmail || null,
          }),
        }
      );

      if (response.ok) {
        console.log("Profile created successfully");
        setShowProfileModal(false);
        router.push("/home");
      } else {
        const errorData = await response.json();
        setProfileError(
          errorData.error || "Failed to create profile. Please try again."
        );
      }
    } catch (error) {
      setProfileError("Network error. Please try again.");
      console.error("Profile creation error:", error);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const closeModal = () => {
    setShowProfileModal(false);
    setProfileName("");
    setProfileEmail("");
    setProfileError("");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {!ready ? (
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-white">Sign In</h1>
          {isCheckingProfile && (
            <div className="flex flex-col items-center gap-2">
              <svg
                aria-hidden="true"
                className="inline w-6 h-6 text-white animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4V1L8 5l1.41 1.41L11 4.17V15l2.59-2.59L17 11l-6 6z"
                  fill="currentColor"
                />
              </svg>
              <p className="text-gray-300 text-sm">Checking profile...</p>
            </div>
          )}
          {authenticated && !isCheckingProfile && (
            <div className="flex flex-col justify-center items-center gap-1">
              <p className="text-white">Login Successful</p>
              <div>
                <p className="text-gray-300">
                  Your ID: {userId ?? "Not Found"}
                </p>
                <p className="text-gray-300">
                  Wallet: {walletAddress ?? "Wallet has not been created yet"}
                </p>
              </div>
            </div>
          )}
          {!authenticated && (
            <div className="w-full">
              <button
                type="button"
                onClick={() => void login()}
                className="text-[#939094] bg-[#93909437] hover:bg-[#939094] hover:text-white font-normal rounded-full text-sm px-3 py-1 transition duration-300 ease-in-out"
              >
                Pop Up • Sign In
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Creation Modal */}
      {showProfileModal && (
        <div
          className={`fixed inset-0 ${
            isInputFocused ? "bg-black/70 backdrop-blur-sm" : "bg-black/50"
          } flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out`}
        >
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Complete Your Profile
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Welcome to ATFI! Please provide your name to continue.
            </p>

            {profileError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{profileError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={createProfile}
                  disabled={isCreatingProfile || !profileName.trim()}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingProfile ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        aria-hidden="true"
                        className="inline w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4V1L8 5l1.41 1.41L11 4.17V15l2.59-2.59L17 11l-6 6z"
                          fill="currentColor"
                        />
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    "Create Profile"
                  )}
                </button>
              </div>
            </div>

            <div className="text-center text-gray-500 text-xs mt-4 space-y-1">
              {userEmail && <div>Email: {userEmail}</div>}
              <div>
                Your wallet address:{" "}
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
