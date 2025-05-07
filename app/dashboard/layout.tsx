
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { DashboardSidebar } from "@/app/dashboard/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"



const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="min-h-screen bg-gray-50">
        <GoogleOAuthProvider clientId={googleClientId}>
        <SidebarProvider defaultOpen={true}>
            <DashboardSidebar />
          <Toaster position="top-center" richColors />     
             <main className="px-12"> 
             <SidebarTrigger />       
                {children}
              </main>
        </SidebarProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
