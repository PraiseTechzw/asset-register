import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
                <TopHeader />
                <main className="flex-1 overflow-y-auto p-6 bg-[url('/grid-bg.svg')] bg-fixed">
                    {children}
                </main>
            </div>
        </div>
    );
}
