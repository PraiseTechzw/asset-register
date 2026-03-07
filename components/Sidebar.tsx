"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ScanLine, Settings, Truck, ClipboardCheck, History, BarChart2, X } from 'lucide-react';

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

    const linkClass = (path: string) => [
        'flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl transition-all group relative overflow-hidden',
        isActive(path)
            ? 'text-white bg-white/[0.04]'
            : 'text-white/40 hover:text-white hover:bg-white/[0.03]',
    ].join(' ');

    const iconClass = (path: string) => [
        'w-4 h-4 transition-colors z-10 flex-shrink-0',
        isActive(path) ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'text-white/20 group-hover:text-blue-500',
    ].join(' ');

    const ActivePip = () => (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
    );

    return (
        <aside className="w-64 h-full border-r border-[#1a1a1a] bg-[#050505] flex flex-col shadow-2xl">
            {/* Logo */}
            <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-[#1a1a1a] bg-gradient-to-r from-[#050505] to-[#0a0a0a] flex-shrink-0">
                <h1 className="text-2xl font-black italic tracking-tighter text-white">
                    Asset<span className="text-blue-500">Node</span>
                </h1>
                {/* Close button - mobile only */}
                <button
                    onClick={onClose}
                    className="lg:hidden text-white/40 hover:text-white transition-colors p-1"
                    aria-label="Close sidebar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                <Link href="/" className={linkClass('/')}>
                    {isActive('/') && <ActivePip />}
                    <Home className={iconClass('/')} />
                    <span className="z-10">Dashboard</span>
                </Link>
                <Link href="/analytics" className={linkClass('/analytics')}>
                    {isActive('/analytics') && <ActivePip />}
                    <BarChart2 className={iconClass('/analytics')} />
                    <span className="z-10">Analytics</span>
                </Link>
                <Link href="/assets" className={linkClass('/assets')}>
                    {isActive('/assets') && <ActivePip />}
                    <Package className={iconClass('/assets')} />
                    <span className="z-10">Inventory</span>
                </Link>
                <Link href="/transfers" className={linkClass('/transfers')}>
                    {isActive('/transfers') && <ActivePip />}
                    <Truck className={iconClass('/transfers')} />
                    <span className="z-10">Transfers</span>
                </Link>
                <Link href="/audits" className={linkClass('/audits')}>
                    {isActive('/audits') && <ActivePip />}
                    <ClipboardCheck className={iconClass('/audits')} />
                    <span className="z-10">Compliance</span>
                </Link>
                <Link href="/logs" className={linkClass('/logs')}>
                    {isActive('/logs') && <ActivePip />}
                    <History className={iconClass('/logs')} />
                    <span className="z-10">Activity Logs</span>
                </Link>

                <div className="pt-6 pb-3 px-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                    <span className="text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">Operations</span>
                </div>

                <Link href="/scanner" className="flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all border border-blue-500/20 active:scale-[0.98] group">
                    <ScanLine className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                    QR Scanner
                </Link>
            </nav>

            {/* Bottom Settings */}
            <div className="p-4 border-t border-[#1a1a1a] bg-gradient-to-t from-[#0a0a0a] to-[#050505] flex-shrink-0">
                <Link href="/settings" className={linkClass('/settings')}>
                    {isActive('/settings') && <ActivePip />}
                    <Settings className={iconClass('/settings')} />
                    <span className="z-10">Settings</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
