import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
import { MapboxProvider } from "@/contexts/MapboxContext";
import PWA from './pwa';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <PWA />
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
