"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
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
                setError(data.error || 'Identity verification failed.');
            }
        } catch (err) {
            setError('Neural link error. Check network connectivity.');
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
                className="w-full max-w-lg px-6 py-12 relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="relative inline-block mb-6"
                    >
                        <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.1)] flex items-center justify-center relative overflow-hidden group">
                            <Image
                                src="/images/logo.png"
                                alt="AssetNode Logo"
                                width={80}
                                height={80}
                                className="object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </motion.div>

                    <h1 className="text-5xl font-black tracking-tighter text-white italic">
                        Asset<span className="text-blue-500">Node</span>
                    </h1>
                    <p className="text-white/40 mt-4 font-mono text-xs tracking-[0.3em] uppercase">
                        Enterprise Asset Matrix • ZOU Cluster
                    </p>
                </div>

                <div className="glass-panel p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[11px] font-black tracking-widest uppercase text-center overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Work Identity</label>
                            <div className="relative group/field">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/field:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4.5 pl-14 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder:text-white/10"
                                    placeholder="admin@zou.ac.zw"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Access Key</label>
                            <div className="relative group/field">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/field:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4.5 pl-14 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder:text-white/10"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-2xl text-xs font-black tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-3 mt-8 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>INITIATE CONSOLE <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-lg">99.9%</span>
                            <span className="text-white/20 text-[9px] font-mono tracking-widest uppercase">Uptime</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-lg">256B</span>
                            <span className="text-white/20 text-[9px] font-mono tracking-widest uppercase">Encryption</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-lg">AES</span>
                            <span className="text-white/20 text-[9px] font-mono tracking-widest uppercase">Protocol</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-white/20 font-bold tracking-widest leading-relaxed">
                        POWERED BY ASSETNODE CORE • DISTRIBUTED LEDGER TECHNOLOGY<br />
                        © 2026 ZIMBABWE OPEN UNIVERSITY DIGITAL TRANSFORMATION
                    </p>
                </div>
            </motion.div>

            <style jsx global>{`
                .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
            `}</style>
        </div>
    );
}
