"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Store in localStorage for client-side persistence
                localStorage.setItem('token', data.token);

                // Set cookie for middleware access
                document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

                // Redirect to dashboard
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Invalid email or password.');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-y-auto">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/grid-bg.svg')] opacity-20" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md px-6 py-12 relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="relative inline-block mb-6"
                    >
                        <div className="w-20 h-20 bg-blue-600/10 rounded-3xl border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.1)] flex items-center justify-center relative overflow-hidden group">
                            <Image
                                src="/images/logo.png"
                                alt="AssetNode Logo"
                                width={60}
                                height={60}
                                className="object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
                        </div>
                    </motion.div>

                    <h1 className="text-4xl font-black tracking-tighter text-white italic">
                        Asset<span className="text-blue-500">Node</span>
                    </h1>
                    <p className="text-white/40 mt-3 text-sm">
                        Enterprise Asset Management
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group/field">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/field:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder:text-white/10"
                                    placeholder="admin@zou.ac.zw"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group/field">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/field:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder:text-white/10"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl text-sm font-bold shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 mt-8 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-xs text-white/30 font-medium">
                    © 2026 Zimbabwe Open University
                </div>
            </motion.div>
        </div>
    );
}
