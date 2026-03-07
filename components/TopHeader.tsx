import { Bell, Search, UserCircle } from 'lucide-react';

const TopHeader = () => {
    return (
        <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-6 sticky top-0 z-10 glass-panel">
            <div className="flex items-center w-96 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                    type="text"
                    placeholder="Search items, QR codes, departments..."
                    className="w-full pl-10 pr-4 py-2 bg-[var(--accent)] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all text-[var(--foreground)]"
                />
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-[var(--accent)] transition-colors">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                </button>
                <button className="flex items-center gap-2 border border-[var(--border)] rounded-full pl-1 pr-3 py-1 hover:bg-[var(--accent)] transition-colors">
                    <UserCircle className="w-6 h-6 text-gray-400" />
                    <span className="text-sm font-medium text-[var(--foreground)]">Admin</span>
                </button>
            </div>
        </header>
    );
};

export default TopHeader;
