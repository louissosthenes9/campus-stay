import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function BrokerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={"en"} className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <GoogleOAuthProvider clientId={googleClientId}>
          <Toaster  position="top-center"/>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
