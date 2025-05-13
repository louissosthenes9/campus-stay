'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Admin Dashboard', href: '/admin' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Listings', href: '/admin/listings' },
    { name: 'Complaints', href: '/admin/complaints' },
    { name: 'Universities', href: '/admin/universities' },
    { name: 'Amenities', href: '/admin/amenities' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white shadow-md h-screen p-6 flex flex-col justify-between">
            <div>
                <h1 className="text-2xl font-bold text-indigo-600 mb-8">campusStay</h1>
                <nav>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'block py-2 px-4 rounded-lg mb-2 text-black hover:bg-gray-100 transition-colors',
                                pathname === item.href ? 'bg-indigo-600 text-white' : ''
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
            <Link href="/login" className="text-black hover:text-indigo-600 flex items-center gap-2">
                <span>Logout</span>
            </Link>
        </aside>
    );
}