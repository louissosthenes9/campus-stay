import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MapboxProvider } from "@/contexts/MapboxContext";

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
  viewport: "width=device-width, initial-scale=1",
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col">
        <GoogleOAuthProvider clientId={googleClientId}>
          <Toaster position="top-center" richColors />
          <AuthProvider>
            <MapboxProvider>
              {children}
            </MapboxProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}