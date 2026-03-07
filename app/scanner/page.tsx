"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    ScanLine,
    AlertTriangle,
    CheckCircle,
    Navigation,
    History,
    Camera,
    ArrowRight,
    Search,
    RefreshCw,
    X,
    ChevronLeft
} from 'lucide-react';
import AssetCard from '@/components/AssetCard';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ScannerPage() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isRecharging, setIsRecharging] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // Request geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }

        // Load history
        const savedHistory = localStorage.getItem('scan_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));

        // Initialize Headless Scanner
        const startScanner = async () => {
            try {
                const scanner = new Html5Qrcode("reader");
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 20,
                        qrbox: (viewfinderWidth, viewfinderHeight) => {
                            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                            const qrboxSize = Math.floor(minEdge * 0.7);
                            return { width: qrboxSize, height: qrboxSize };
                        }
                    },
                    (decodedText) => {
                        stopScanner();
                        processScan(decodedText);
                    },
                    () => { }
                );
                setScanning(true);
            } catch (err) {
                console.error("Camera access failed", err);
                setError("Camera access denied. Please ensure permissions are granted.");
            }
        };

        const stopScanner = async () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                await scannerRef.current.stop();
                setScanning(false);
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const processScan = async (code: string) => {
        setIsRecharging(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch("/api/scans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    qrCodeHash: code,
                    latitude: location?.lat,
                    longitude: location?.lng,
                    address: "Detected via GPS"
                })
            });

            if (res.ok) {
                const data = await res.json();
                setScanResult(data.asset);
                const newHistory = [{ ...data.asset, timestamp: new Date().toISOString() }, ...history.slice(0, 4)];
                setHistory(newHistory);
                localStorage.setItem('scan_history', JSON.stringify(newHistory));
            } else {
                const data = await res.json();
                setError(data.error || "Asset signature not recognized.");
            }
        } catch (e) {
            setError("Network failure. Connection lost.");
        } finally {
            setIsRecharging(false);
        }
    };

    const handleReset = () => {
        setScanResult(null);
        setError(null);
        window.location.reload();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Left: Premium Scanner Viewport */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative flex-1 bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl group"
                >
                    {/* Floating Navigation */}
                    <Link href="/assets" className="absolute top-6 left-6 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white/70 hover:text-white transition-all shadow-lg active:scale-95 group-hover:bg-black/60">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>

                    {/* Top Status HUD */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-40 px-8 flex items-center justify-end pointer-events-none">
                        <div className="flex items-center gap-4">
                            {location && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="px-4 py-2 bg-blue-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 flex items-center gap-2"
                                >
                                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[10px] font-bold text-blue-400 font-mono tracking-tighter uppercase">GPS LOCATED</span>
                                </motion.div>
                            )}
                            <div className="px-4 py-2 bg-emerald-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/20 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400 font-mono tracking-tighter uppercase">SECURE_LINK</span>
                            </div>
                        </div>
                    </div>

                    {/* The Headless Video Element */}
                    <div id="reader" className="w-full h-full flex items-center justify-center"></div>

                    {/* Custom Scanning HUD Overlay */}
                    <AnimatePresence>
                        {scanning && !isRecharging && !scanResult && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
                            >
                                {/* The "Action Box" Viewfinder */}
                                <div className="w-72 h-72 relative">
                                    {/* Animated Corner Brackets */}
                                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white/80 rounded-tl-3xl shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white/80 rounded-tr-3xl shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white/80 rounded-bl-3xl shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white/80 rounded-br-3xl shadow-[0_0_15px_rgba(255,255,255,0.2)]" />

                                    {/* The Scanning Laser */}
                                    <motion.div
                                        animate={{ top: ['10%', '90%', '10%'] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_#3b82f6] z-10"
                                    />

                                    {/* Pulse Effect */}
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-3xl animate-pulse" />
                                </div>

                                <div className="absolute bottom-20 flex flex-col items-center gap-3">
                                    <div className="px-5 py-2.5 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10">
                                        <p className="text-white text-sm font-medium">Place QR Code in the frame</p>
                                    </div>
                                    <p className="text-white/30 text-[9px] font-mono tracking-[0.4em] uppercase">Autofocus Enabled</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Result Screens (Success/Fail/Loading) */}
                    <AnimatePresence mode="wait">
                        {isRecharging && (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center">
                                <RefreshCw className="w-14 h-14 text-blue-500 animate-spin mb-6" />
                                <h4 className="text-xl font-bold text-white tracking-widest uppercase">Validating Hash</h4>
                            </motion.div>
                        )}

                        {scanResult && (
                            <motion.div key="success" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8">
                                <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/30 shadow-[0_30px_60px_-12px_rgba(16,185,129,0.3)]">
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-2 italic">VERIFIED</h3>
                                <p className="text-white/40 text-sm mb-12 font-mono">ENCRYPTED_ID: {scanResult.id.slice(0, 16)}...</p>

                                <div className="w-full max-w-sm">
                                    <AssetCard {...scanResult} lastAudit="Audit Completed Now" />
                                </div>

                                <div className="flex gap-4 mt-12 w-full max-w-sm">
                                    <button onClick={handleReset} className="flex-1 py-4.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all active:scale-95">
                                        RESCAN
                                    </button>
                                    <Link href={`/assets/${scanResult.id}`} className="flex-1 py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95">
                                        PROFILE <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 bg-rose-500/20 rounded-[2rem] flex items-center justify-center mb-8 border border-rose-500/30 shadow-[0_30px_60px_-12px_rgba(244,63,94,0.3)]">
                                    <AlertTriangle className="w-12 h-12 text-rose-500" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 italic tracking-tight">ERROR_LNK</h3>
                                <p className="text-white/60 mb-12 text-lg max-w-xs mx-auto font-medium">{error}</p>

                                <button onClick={handleReset} className="w-full max-w-sm py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] transition-all active:scale-95 uppercase tracking-widest">
                                    Re-Initiate Scanner
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Right: History Hub */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col h-full bg-[#0a0a0a]/40 backdrop-blur-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <History className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-xl tracking-tight">SESSION LOG</h4>
                                <p className="text-white/30 text-[10px] font-mono tracking-widest uppercase">Local Cache Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {history.length > 0 ? history.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="group p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all cursor-pointer relative overflow-hidden active:scale-95"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white font-bold text-base truncate pr-8">{item.name}</span>
                                    <div className="p-2 bg-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-blue-400" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                                        <span className="text-[10px] text-white/40 font-mono tracking-tighter italic uppercase">{item.category}</span>
                                    </div>
                                    <span className="text-[11px] text-white/30 font-medium">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-10">
                                <Search className="w-16 h-16 mb-6" />
                                <p className="text-base text-center font-bold">NO VERIFIED ENTRIES</p>
                            </div>
                        )}
                    </div>

                    <button className="mt-8 w-full py-5 border border-white/10 hover:border-white/20 rounded-2xl text-white/40 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/5 active:scale-95">
                        Clear Memory
                    </button>
                </div>
            </div>

            <style jsx global>{`
                #reader { 
                    position: relative !important; 
                    width: 100% !important; 
                    height: 100% !important;
                    background: black !important;
                }
                #reader video { 
                    width: 100% !important; 
                    height: 100% !important;
                    object-fit: cover !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                }
                #reader canvas { display: none !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
                .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
            `}</style>
        </div>
    );
}
