import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ".";

// Initialize the Inter font
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

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={params.locale || "en"} className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
