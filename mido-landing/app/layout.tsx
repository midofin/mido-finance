import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import WalletContextProvider from "@/context/WalletContextProvider";
import ParticleBackground from "@/components/landing/SplineBackground";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mido Refi",
  description: "Mido Refi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <WalletContextProvider>
      <ParticleBackground />

        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </WalletContextProvider>
    </html>
  );
}
