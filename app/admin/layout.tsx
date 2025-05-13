import sidebar from '@/components/ui/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="flex">
        <sidebar />
        <main className="flex-1 p-4 bg-gray-50">{children}</main>
        </body>
        </html>
    );
}