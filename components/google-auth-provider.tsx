// components/google-oauth-provider.tsx (Client Component)
"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleOAuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  
  if (!googleClientId) {
    console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable");
    return <>{children}</>; // Fallback without provider
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}