import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asset Register | Zim Open University",
  description: "QR Code-Based Digital Data Collection System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
            <TopHeader />
            <main className="flex-1 overflow-y-auto p-6 bg-[url('/grid-bg.svg')] bg-fixed">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

