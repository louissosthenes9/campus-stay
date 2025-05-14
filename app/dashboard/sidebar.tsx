"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BROKER_SIDEBAR_ITEMS, BROKER_FOOTER_MENU_ITEMS } from "../../lib/menus";

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar className="border-r">
      {/* Header */}
      <SidebarHeader className="flex items-center gap-2 px-2">
        <div className="flex items-center gap-2 p-2">
          <div className="font-medium text-xl">campus<span className="text-indigo-500">Stay</span></div>
        </div>
      </SidebarHeader>

      {/* Main Menu */}
      <SidebarContent>
        <SidebarMenu>
          {BROKER_SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === href ? true : false}
                tooltip={label}
              >
                <Link href={href}>
                  <Icon className="mr-2" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer Menu */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          {BROKER_FOOTER_MENU_ITEMS.map(({ label, href, icon: Icon }) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton asChild isActive={pathname === href} >
                {href !== "#" ? (
                  <Link href={href}>
                    <Icon className="mr-2" />
                    <span>{label}</span>
                  </Link>
                ) : (
                  <button type="button" onClick={() => {}}>
                    <Icon className="mr-2" />
                    <span>{label}</span>
                  </button>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}