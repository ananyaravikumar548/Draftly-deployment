import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/inter/latin.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draftly — Your portfolio, tailored. Your application, drafted.",
  description: "Tailor your portfolio to each opportunity and draft thoughtful, evidence-based job applications.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
