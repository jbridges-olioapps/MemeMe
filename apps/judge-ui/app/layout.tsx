import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MemeMe",
  description: "Run a MemeMe demo from a single prompt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
