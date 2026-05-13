"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function ConvexNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--bg)" }}>
      <div className="card p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">C</div>
        <h1 className="text-2xl font-black mb-2 gradient-text">Almost ready!</h1>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          Convex is not configured yet. Run the following command in your terminal to get started:
        </p>
        <pre className="text-left p-4 rounded-xl text-sm font-mono mb-4" style={{ background: "var(--surface-2)", color: "#A5B4FC", border: "1px solid var(--border)" }}>
          npx convex dev
        </pre>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Then copy the <code className="px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)" }}>NEXT_PUBLIC_CONVEX_URL</code> it prints into your <code className="px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)" }}>.env.local</code> file and restart the dev server.
        </p>
      </div>
    </div>
  );
}

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!convex ? (
        <ConvexNotConfigured />
      ) : (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                background: "var(--toast-bg, #1e1e2e)",
                color: "var(--toast-color, #fff)",
                border: "1px solid rgba(124,58,237,0.3)",
              },
            }}
          />
        </ConvexProviderWithClerk>
      )}
    </ThemeProvider>
  );
}
