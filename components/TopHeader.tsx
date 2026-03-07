"use client";

import { Bell, Search, UserCircle, LogOut, Package, Truck, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const TopHeader = () => {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [user, setUser] = useState<any>(null);
    const [notifs, setNotifs] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setNotifs(data.notifications);
                } else if (res.status === 401) {
                    localStorage.removeItem('token');
                    // router.push('/login'); // We'll enable this once login page is ready
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };

        fetchUserData();
        const interval = setInterval(fetchUserData, 60000);
        return () => clearInterval(interval);
    }, [router]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/assets?q=${encodeURIComponent(query)}`);
            setQuery('');
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
                    placeholder="Search ID, Name, Dept..."
                    className="w-full pl-10 pr-4 py-2 bg-[var(--accent)] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all text-[var(--foreground)]"
                />
            </form>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative p-2 rounded-full hover:bg-[var(--accent)] transition-colors group"
                    >
                        <Bell className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        {notifs && notifs.total > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                {notifs.total > 9 ? '9+' : notifs.total}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                            <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">System Notifications</h3>
                            <div className="space-y-2">
                                {notifs?.pendingMovements > 0 && (
                                    <Link href="/transfers" className="flex items-start gap-3 p-2 hover:bg-[var(--accent)] rounded-xl transition-colors">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Truck className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--foreground)]">{notifs.pendingMovements} Pending Transfers</p>
                                            <p className="text-[10px] text-gray-500">Requires administrative approval</p>
                                        </div>
                                    </Link>
                                )}
                                {notifs?.criticalAssets > 0 && (
                                    <Link href="/audits" className="flex items-start gap-3 p-2 hover:bg-[var(--accent)] rounded-xl transition-colors">
                                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><AlertTriangle className="w-4 h-4" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--foreground)]">{notifs.criticalAssets} Critical Issues</p>
                                            <p className="text-[10px] text-gray-500">Missing or scrapped assets logged</p>
                                        </div>
                                    </Link>
                                )}
                                {(!notifs || notifs.total === 0) && (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-gray-500">All systems optimal</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 border border-[var(--border)] rounded-full pl-1 pr-3 py-1 hover:bg-[var(--accent)] transition-colors"
                    >
                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="w-6 h-6 text-gray-400" />}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-bold text-[var(--foreground)] leading-none">{user?.name || 'Guest'}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-tighter mt-0.5">{user?.role?.replace('_', ' ') || 'Role Unknown'}</p>
                        </div>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                            <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                                <p className="text-xs font-bold text-[var(--foreground)] truncate">{user?.email || 'Not logged in'}</p>
                                <p className="text-[10px] text-gray-500">Node: {user?.departmentId || 'System Root'}</p>
                            </div>
                            <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded-lg transition-colors">
                                <Package className="w-4 h-4" /> Account Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
