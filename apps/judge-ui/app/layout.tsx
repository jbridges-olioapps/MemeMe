import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MemeMe",
  description: "Save hours of sending reels with your friends.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
