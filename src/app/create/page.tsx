"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatePage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      try {
        const address = JSON.parse(storedAddress);
        setWalletAddress(address);
      } catch (error) {
        console.error("Error parsing wallet address:", error);
      }
    } else {
      router.push("/signin");
    }
  }, [router]);

  if (!walletAddress) {
    return null;
  }

  return (
    <>
      <h1>Create Page</h1>
      <pre>{JSON.stringify(walletAddress, null, 2)}</pre>
    </>
  );
}
