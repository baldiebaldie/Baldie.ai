import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Baldie.ai — AI Learning & News",
  description: "Synthesized AI news and tools for developers building AI careers.",
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
