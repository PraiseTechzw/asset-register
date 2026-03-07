import Link from 'next/link';
import { Home, Package, BarChart2, ScanLine, Settings } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-64 h-screen border-r border-[var(--border)] bg-[var(--background)] flex flex-col fixed left-0 top-0">
            <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
                <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Asset<span className="text-blue-500">Register</span></h1>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-2">
                <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors">
                    <Home className="w-5 h-5 text-gray-400" />
                    Dashboard
                </Link>
                <Link href="/assets" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors">
                    <Package className="w-5 h-5 text-gray-400" />
                    Assets
                </Link>
                <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors">
                    <BarChart2 className="w-5 h-5 text-gray-400" />
                    Analytics
                </Link>
                <Link href="/scanner" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors">
                    <ScanLine className="w-5 h-5 text-gray-400" />
                    Scanner
                </Link>
            </nav>
            <div className="p-4 border-t border-[var(--border)]">
                <button className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium rounded-lg hover:bg-[var(--accent)] text-[var(--foreground)] transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Settings
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
