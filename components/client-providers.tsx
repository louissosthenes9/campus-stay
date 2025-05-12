"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const GoogleOAuthProvider = dynamic(
  () => import("@/components/google-auth-provider"),
  { ssr: false }
);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider>
      {children}
    </GoogleOAuthProvider>
  );
}