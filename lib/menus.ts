import {
    LayoutDashboard,
    Building,
    MessageSquare,
    Settings,
    LogOut,
  } from "lucide-react";
  
  export const BROKER_SIDEBAR_ITEMS = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Property Management",
      href: "/dashboard/properties",
      icon: Building,
    },
    {
      label: "Enquiry Management",
      href: "/dashboard/enquiries",
      icon: MessageSquare,
    },
  ];
  
  export const BROKER_FOOTER_MENU_ITEMS = [
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      label: "Logout",
      href: "#",
      icon: LogOut,
      action: () => {
        
        console.log("Logging out...");
      },
    },
  ];
  