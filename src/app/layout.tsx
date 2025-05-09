import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/chatbot.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "32Mins Learning Partner Device",
  description: "User Testing Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Register service worker for cross-tab text extraction

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
