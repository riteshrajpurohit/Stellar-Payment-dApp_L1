import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Stellar Testnet Payment Console",
  description:
    "Production-ready Stellar Testnet payment dApp with Freighter wallet support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
        <Toaster richColors closeButton position="top-right" theme="dark" />
      </body>
    </html>
  );
}
