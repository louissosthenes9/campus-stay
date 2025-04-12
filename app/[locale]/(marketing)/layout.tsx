import type { Metadata } from "next";
import "@/app/globals.css";  // Fixed import path to use the global CSS
import React from "react";

export const metadata: Metadata = {
  title: "Campus Stay | Student Accommodation Platform",
  description: "Find verified student accommodation near universities across Tanzania. Secure booking, affordable prices, and stress-free housing experience.",
  keywords: "student accommodation, campus housing, university dorms, student living, Tanzania universities",
  openGraph: {
    title: "Campus Stay | Student Accommodation Platform",
    description: "Find verified student accommodation near universities across Tanzania",
    type: "website",
    locale: "en_US",
    url: "https://campusstay.com",
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>{children}</>
  );
}
