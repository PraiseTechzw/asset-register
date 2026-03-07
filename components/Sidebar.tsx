import Link from 'next/link';
import { Home, Package, BarChart2, ScanLine, Settings, Truck, ClipboardCheck, History } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-64 h-screen border-r border-white/5 bg-[#050505] flex flex-col fixed left-0 top-0 z-40">
            <div className="h-20 flex items-center px-6 border-b border-white/5">
                <h1 className="text-2xl font-black italic tracking-tighter text-white">Asset<span className="text-blue-500">Node</span></h1>
            </div>
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl hover:bg-white/[0.03] text-white/40 hover:text-white transition-all group">
                    <Home className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors" />
                    Dashboard
                </Link>
                <Link href="/assets" className="flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl hover:bg-white/[0.03] text-white/40 hover:text-white transition-all group">
                    <Package className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors" />
                    Inventory
                </Link>
                <Link href="/transfers" className="flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl hover:bg-white/[0.03] text-white/40 hover:text-white transition-all group">
                    <Truck className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors" />
                    Transfers
                </Link>
                <Link href="/audits" className="flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl hover:bg-white/[0.03] text-white/40 hover:text-white transition-all group">
                    <ClipboardCheck className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors" />
                    Compliance
                </Link>
                <Link href="/logs" className="flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl hover:bg-white/[0.03] text-white/40 hover:text-white transition-all group">
                    <History className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors" />
                    Activity Logs
                </Link>

                <div className="pt-8 pb-4 px-4 text-[10px] font-black text-white/10 tracking-[0.3em] uppercase">Operations</div>

                <Link href="/scanner" className="flex items-center gap-3 px-5 py-4 text-xs font-black tracking-widest uppercase rounded-2xl bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all">
                    <ScanLine className="w-4 h-4" />
                    QR Scanner
                </Link>
            </nav>
            <div className="p-4 border-t border-white/5">
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase rounded-2xl hover:bg-white/[0.03] text-white/40 hover:text-white transition-all group">
                    <Settings className="w-4 h-4 text-white/20 group-hover:text-blue-500 transition-colors" />
                    Settings
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;

