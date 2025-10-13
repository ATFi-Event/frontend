import * as React from "react";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
/* Material Symbols */
import "material-symbols";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATFI",
  description: "Event DeFi Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={rubik.className}>{children}</body>
    </html>
  );
}
