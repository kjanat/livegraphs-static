import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "LiveGraphs - Chatbot Analytics Dashboard",
  description: "Visualize and analyze chatbot conversation data with interactive charts",
  icons: {
    icon: [
      {
        url: "/notsoAI-black.svg",
        media: "(prefers-color-scheme: light)"
      },
      {
        url: "/notsoAI-white.svg",
        media: "(prefers-color-scheme: dark)"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
