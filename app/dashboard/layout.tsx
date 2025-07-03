
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DashboardSidebar } from "@/app/dashboard/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ClientProviders from "@/components/client-providers";
import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
      <main className="min-h-screen bg-gray-50 flex">
        <SidebarProvider defaultOpen={true} >
          <ClientProviders>
            <DashboardSidebar />
            <div className="px-12 flex-1">
              <SidebarTrigger />
              <AuthProvider>
                {children}
              </AuthProvider>
            </div>
            <Toaster position="top-center" richColors />
          </ClientProviders>
        </SidebarProvider>
        </main>
   
  );
}