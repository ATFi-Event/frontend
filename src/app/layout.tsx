import * as React from "react";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
/* Material Symbols */
import "material-symbols";
import { ThemeModeScript } from "flowbite-react";
import { Providers } from "@/components/features/PrivyProvider";

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
      <head>
        <ThemeModeScript />
      </head>
      <body className={rubik.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
