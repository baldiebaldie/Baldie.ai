import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Baldie.ai — AI Learning & News",
  description: "Synthesized AI news and tools for developers building AI careers.",
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <nav
          style={{
            borderBottom: "1px solid #e5e7eb",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <Link
            href="/"
            style={{ fontWeight: 700, color: "#111", textDecoration: "none", fontSize: 16 }}
          >
            Baldie.ai
          </Link>
          <Link
            href="/discover"
            style={{ color: "#6b7280", textDecoration: "none", fontSize: 14 }}
          >
            Discover
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
