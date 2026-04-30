"use client";

import { useEffect, useRef, useState } from "react";
import { post } from "../lib/api";
import type { User } from "../types";

type GoogleAuthButtonProps = {
  onSuccess: (token: string, user: User) => void;
};

const GoogleAuthButton = ({ onSuccess }: GoogleAuthButtonProps) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const initializeButton = (id: string) => {
      if (!buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: id,
        callback: async (credentialResponse) => {
          if (!credentialResponse.credential) {
            setError("Google authentication failed");
            return;
          }

          setLoading(true);
          setError(null);

          try {
            const response = await post<{
              token: string;
              user: User | { id: string; name: string; email: string };
            }>("/api/auth/google", { googleToken: credentialResponse.credential });
            setLoading(false);

            if (!response.success || !response.data) {
              setError(response.message || "Google login failed");
              return;
            }

            const rawUser = response.data.user as User | { id: string; name: string; email: string };
            const normalizedUser: User = {
              _id: "_id" in rawUser ? rawUser._id : rawUser.id,
              name: rawUser.name,
              email: rawUser.email,
            };
            onSuccessRef.current(response.data.token, normalizedUser);
          } catch (err) {
            setLoading(false);
            const message = err instanceof Error ? err.message : "Google login failed";
            setError(message);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: 320,
      });
    };

    const existingScript = document.getElementById("google-oauth-script");
    if (existingScript) {
      initializeButton(clientId);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-oauth-script";
    script.onload = () => initializeButton(clientId);
    script.onerror = () => setError("Failed to load Google OAuth script");
    document.body.appendChild(script);
  }, [clientId]);

  return (
    <div className="w-full">
      <div ref={buttonRef} className="flex justify-center" />
      {!clientId && <p className="mt-2 text-center text-xs text-red-600">Google client ID is not configured</p>}
      {loading && <p className="mt-2 text-center text-xs text-slate-500">Connecting...</p>}
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default GoogleAuthButton;

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; text: string; width: number }) => void;
        };
      };
    };
  }
}
