"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ScanLine, Settings, Truck, ClipboardCheck, History, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/' && pathname !== '/') return false;
        return pathname?.startsWith(path);
    };

    const linkStyle = (path: string) => `
        flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl transition-all group relative overflow-hidden
        ${isActive(path)
            ? 'bg-blue-600/10 text-blue-500 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)] border border-blue-500/20'
            : 'hover:bg-white/[0.03] text-white/40 hover:text-white border border-transparent'}
    `;

    const iconStyle = (path: string) => `
        w-4 h-4 transition-colors z-10
        ${isActive(path) ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'text-white/20 group-hover:text-blue-500'}
    `;

    return (
        <aside className="w-64 h-screen border-r border-[#1a1a1a] bg-[#050505] flex flex-col fixed left-0 top-0 z-40 shadow-2xl">
            <div className="h-20 flex items-center px-6 border-b border-[#1a1a1a] bg-gradient-to-r from-[#050505] to-[#0a0a0a]">
                <h1 className="text-2xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform cursor-pointer">
                    Asset<span className="text-blue-500">Node</span>
                </h1>
            </div>

            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <Link href="/" className={linkStyle('/')}>
                    {isActive('/') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    <Home className={iconStyle('/')} />
                    <span className="z-10">Dashboard</span>
                </Link>
                <Link href="/analytics" className={linkStyle('/analytics')}>
                    {isActive('/analytics') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    <BarChart2 className={iconStyle('/analytics')} />
                    <span className="z-10">Analytics</span>
                </Link>
                <Link href="/assets" className={linkStyle('/assets')}>
                    {isActive('/assets') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    <Package className={iconStyle('/assets')} />
                    <span className="z-10">Inventory</span>
                </Link>
                <Link href="/transfers" className={linkStyle('/transfers')}>
                    {isActive('/transfers') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    <Truck className={iconStyle('/transfers')} />
                    <span className="z-10">Transfers</span>
                </Link>
                <Link href="/audits" className={linkStyle('/audits')}>
                    {isActive('/audits') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    <ClipboardCheck className={iconStyle('/audits')} />
                    <span className="z-10">Compliance</span>
                </Link>
                <Link href="/logs" className={linkStyle('/logs')}>
                    {isActive('/logs') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    <History className={iconStyle('/logs')} />
                    <span className="z-10">Activity Logs</span>
                </Link>

                <div className="pt-8 pb-4 px-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                    <span className="text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">Operations</span>
                </div>

                <Link href="/scanner" className="flex items-center gap-3 px-5 py-4 text-xs font-black tracking-widest uppercase rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] transition-all border border-blue-400/20 active:scale-95 group">
                    <ScanLine className="w-4 h-4 group-hover:animate-pulse" />
                    QR Scanner
                </Link>
            </nav>

            <div className="p-4 border-t border-[#1a1a1a] bg-gradient-to-t from-[#0a0a0a] to-[#050505]">
                <Link href="/settings" className={linkStyle('/settings')}>
                    {isActive('/settings') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />}
                    <Settings className={iconStyle('/settings')} />
                    <span className="z-10">Settings</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;

