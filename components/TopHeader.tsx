"use client";

import { Bell, Search, UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const TopHeader = () => {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [user, setUser] = useState<any>(null);
    const [notifCount, setNotifCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Not logged in, but we might be on a public page or login page
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setNotifCount(data.notifications.total);
                } else if (res.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login');
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };

        fetchUserData();
        // Refresh notifications every 60 seconds
        const interval = setInterval(fetchUserData, 60000);
        return () => clearInterval(interval);
    }, [router]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/assets?q=${encodeURIComponent(query)}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-6 sticky top-0 z-30 glass-panel">
            <form onSubmit={handleSearch} className="flex items-center w-96 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search items, QR codes, departments..."
                    className="w-full pl-10 pr-4 py-2 bg-[var(--accent)] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all text-[var(--foreground)]"
                />
            </form>

            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-[var(--accent)] transition-colors group">
                    <Bell className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    {notifCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                            {notifCount > 9 ? '9+' : notifCount}
                        </span>
                    )}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 border border-[var(--border)] rounded-full pl-1 pr-3 py-1 hover:bg-[var(--accent)] transition-colors"
                    >
                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="w-6 h-6 text-gray-400" />}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-bold text-[var(--foreground)] leading-none">{user?.name || 'Guest'}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-tighter mt-0.5">{user?.role?.replace('_', ' ') || 'Checking...'}</p>
                        </div>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
                            <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                                <p className="text-xs font-bold text-[var(--foreground)]">{user?.email}</p>
                                <p className="text-[10px] text-gray-500">Dept ID: {user?.departmentId || 'Global'}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
