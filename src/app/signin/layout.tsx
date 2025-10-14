"use client";

import { Providers } from "@/context/PrivyProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
