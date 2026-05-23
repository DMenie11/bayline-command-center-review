import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "BayLine Command Center",
  description: "Shared WMS and TMS review preview for invited reviewers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedIn>
            <header className="review-topbar">
              <div>
                <p className="eyebrow">Shared Preview</p>
                <strong>BayLine Command Center</strong>
              </div>
              <UserButton />
            </header>
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
