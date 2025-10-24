"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface FirstTimeUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FirstTimeUserModal({
  isOpen,
  onClose,
  onSuccess,
}: FirstTimeUserModalProps) {
  const { user } = usePrivy();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Debug: Log the user object structure
  console.log("Privy user object:", user);

  // Extract user information - handle different Privy user structures
  const getUserEmail = () => {
    if (!user) return null;

    // Try different possible email structures
    if (user.email?.address) return user.email.address;
    if (user.email) return user.email;
    if (user.google?.email) return user.google.email;

    return null;
  };

  const getUserWalletAddress = () => {
    if (!user) return null;

    if (user.wallet?.address) return user.wallet.address;

    return null;
  };

  const userEmail = getUserEmail();
  console.log("email" + userEmail);
  const userWalletAddress = getUserWalletAddress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!userWalletAddress) {
      setError("Wallet address not available");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: userWalletAddress,
            name: name.trim(),
            email: userEmail || null, // Send null instead of empty string
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user profile");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">
            Welcome to ATFI! 👋
          </h2>
          <p className="text-gray-300 text-sm">
            Let's set up your profile to get started with your event management
            journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          {userEmail && (
            <div className="text-sm text-gray-300">
              <span className="font-medium">Email:</span> {String(userEmail)}
            </div>
          )}

          {userWalletAddress && (
            <div className="text-sm text-gray-300">
              <span className="font-medium">Wallet:</span>{" "}
              {`${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(
                -4
              )}`}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Profile..." : "Get Started"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
