"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#050505]">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - hidden on mobile, slide-in when open */}
            <div className={`
                fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:h-screen
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[url('/grid-bg.svg')] bg-fixed">
                    {children}
                </main>
            </div>
        </div>
    );
}
