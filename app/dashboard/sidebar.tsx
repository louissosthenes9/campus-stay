'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BROKER_SIDEBAR_ITEMS, BROKER_FOOTER_MENU_ITEMS } from '../../lib/menus';

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r h-full bg-gradient-to-br from-white to-gray-50 shadow-sm">
      {/* Header */}
      <SidebarHeader className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50/70 transition-all duration-300">
          <div className="font-bold text-xl tracking-tight">
            campus<span className="text-indigo-600">Stay</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Menu */}
      <SidebarContent className="px-2.5 py-4">
        <SidebarMenu>
          {BROKER_SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            
            return (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={label}
                  className={`
                    relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg
                    transition-all duration-300
                    ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50/60 hover:text-gray-900'
                    }
                  `}
                >
                  <Link href={href} className="w-full">
                    <div className="flex items-center">
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
                          isActive ? 'text-indigo-600 rotate-0' : 'text-gray-500 rotate-6'
                        }`}
                      />
                      <span className="ml-3 font-medium tracking-tight">{label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-6 w-1.5 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-r-full shadow-sm" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer Menu */}
      <SidebarFooter className="border-t border-gray-100 mt-auto">
        <SidebarMenu className="px-2.5 py-3">
          {BROKER_FOOTER_MENU_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            
            return (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`
                    relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg
                    transition-all duration-300
                    ${
                      isActive
                        ? 'bg-red-50 text-red-700 font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50/60 hover:text-gray-900'
                    }
                  `}
                >
                  {href !== '#' ? (
                    <Link href={href} className="w-full">
                      <div className="flex items-center">
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
                            isActive ? 'text-red-600 rotate-0' : 'text-gray-500 rotate-6'
                          }`}
                        />
                        <span className="ml-3 font-medium tracking-tight">{label}</span>
                      </div>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 h-6 w-1.5 -translate-y-1/2 bg-gradient-to-r from-red-600 to-red-500 rounded-r-full shadow-sm" />
                      )}
                    </Link>
                  ) : (
                    <button type="button" className="w-full text-left hover:bg-gray-50/60">
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-300 hover:rotate-6" />
                        <span className="ml-3 font-medium tracking-tight">{label}</span>
                      </div>
                    </button>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}