import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SWRegistration from "@/components/SWRegistration";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asset Register | Zim Open University",
  description: "QR Code-Based Digital Data Collection System",
};

import { ToastProvider } from "@/components/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <ToastProvider>
          <SWRegistration />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

