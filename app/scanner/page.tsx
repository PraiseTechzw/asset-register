"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    ScanLine,
    AlertTriangle,
    CheckCircle,
    Navigation,
    History,
    Camera,
    Maximize,
    ArrowRight,
    Search,
    RefreshCw
} from 'lucide-react';
import AssetCard from '@/components/AssetCard';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScannerPage() {
    const [scanning, setScanning] = useState(true);
    const [scanResult, setScanResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isRecharging, setIsRecharging] = useState(false);

    useEffect(() => {
        // Request geolocation for audit accuracy
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }

        // Load history from local storage
        const savedHistory = localStorage.getItem('scan_history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 20,
                qrbox: { width: 280, height: 280 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            scanner.clear();
            setScanning(false);
            processScan(decodedText);
        }

        function onScanFailure() {
            // ignore
        }

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, []);

    const processScan = async (code: string) => {
        setIsRecharging(true);
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

                // Add to history
                const newHistory = [
                    { ...data.asset, timestamp: new Date().toISOString() },
                    ...history.slice(0, 4)
                ];
                setHistory(newHistory);
                localStorage.setItem('scan_history', JSON.stringify(newHistory));
            } else {
                const data = await res.json();
                setError(data.error || "Asset not found or synchronization error.");
            }
        } catch (e) {
            setError("Network error. Device potentially offline.");
        } finally {
            setIsRecharging(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Left: Scanner Section */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex-1 bg-black rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Top Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 px-6 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-mono text-emerald-500 tracking-wider">SYSTEM ACTIVE</span>
                        </div>
                        {location && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                                <Navigation className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-medium text-white/70">GPS LCK</span>
                            </div>
                        )}
                    </div>

                    {/* Scanner Viewport */}
                    <div className="flex-1 relative flex items-center justify-center">
                        <div id="reader" className={`w-full max-w-md ${!scanning ? 'hidden' : ''}`}></div>

                        {scanning && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                {/* Guided Frame Overlay */}
                                <div className="w-72 h-72 border-2 border-white/20 rounded-3xl relative">
                                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#3b82f6]"
                                    />
                                </div>
                                <div className="absolute bottom-12 text-center">
                                    <p className="text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase mb-2">Optical Verification</p>
                                    <p className="text-white font-medium">Align QR Code to begin</p>
                                </div>
                            </div>
                        )}

                        {/* Processing Loader */}
                        <AnimatePresence>
                            {isRecharging && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center"
                                >
                                    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    <p className="text-white font-mono tracking-widest text-xs">VERIFYING SIGNATURE</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Overlay */}
                        <AnimatePresence>
                            {scanResult && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Asset Identified</h3>
                                    <p className="text-white/50 text-sm mb-10 font-mono">ID: {scanResult.id}</p>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="w-full max-w-sm"
                                    >
                                        <AssetCard {...scanResult} lastAudit="Verified Just Now" />
                                    </motion.div>

                                    <div className="flex gap-4 mt-12 w-full max-w-sm">
                                        <button onClick={handleReset} className="flex-1 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 rounded-2xl text-white font-semibold transition-all">
                                            New Scan
                                        </button>
                                        <a href={`/assets/${scanResult.id}`} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2">
                                            Details <ArrowRight className="w-4 h-4" />
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error Overlay */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mb-8 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                                        <AlertTriangle className="w-12 h-12 text-rose-500" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Scan Denied</h3>
                                    <p className="text-white/60 mb-12 text-lg max-w-xs mx-auto leading-relaxed">{error}</p>

                                    <div className="flex flex-col gap-3 w-full max-w-sm">
                                        <button onClick={handleReset} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all">
                                            Attempt Rescan
                                        </button>
                                        <button className="w-full py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white/70 rounded-2xl font-semibold transition-all">
                                            Contact Admin
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Right: Scan History & Context */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                {/* Stats Panel */}
                <div className="glass-panel p-6 rounded-3xl border border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Camera className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Scanner Hub</h4>
                            <p className="text-white/40 text-xs">Device Identification Protocol</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <span className="text-white/50 text-sm">Status</span>
                            <span className="text-emerald-500 text-sm font-mono font-bold">READY</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <span className="text-white/50 text-sm">Sensor</span>
                            <span className="text-white/80 text-sm">Camera Stream</span>
                        </div>
                    </div>
                </div>

                {/* History Panel */}
                <div className="flex-1 glass-panel p-6 rounded-3xl border border-[var(--border)] flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-gray-400" />
                            <h4 className="font-bold text-white">Recent Scans</h4>
                        </div>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50 font-mono">LOCAL_LOG</span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                        {history.length > 0 ? history.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium text-sm truncate">{item.name}</span>
                                    <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-white/40 font-mono">{item.id}</span>
                                    <span className="text-[10px] text-white/30">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-20">
                                <Search className="w-12 h-12 mb-4" />
                                <p className="text-sm text-center">No recent activity detected in session</p>
                            </div>
                        )}
                    </div>

                    <button className="mt-6 w-full py-4 border border-white/10 rounded-2xl text-white/40 text-sm font-medium hover:bg-white/5 transition-all">
                        Clear Audit History
                    </button>
                </div>
            </div>

            <style jsx global>{`
                #reader { border: none !important; position: relative !important; width: 100% !important; background: transparent !important; }
                #reader__scan_region { background: transparent !important; }
                #reader__scan_region video { 
                    border-radius: 2rem !important; 
                    object-fit: cover !important;
                    width: 100% !important;
                }
                #reader__dashboard_section_csr button {
                    background: #2563eb !important;
                    color: white !important;
                    border: none !important;
                    padding: 12px 24px !important;
                    border-radius: 12px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    transition: all 0.2s !important;
                    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3) !important;
                }
                #reader__dashboard_section_csr button:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 25px rgba(37, 99, 235, 0.4) !important;
                }
                #reader__camera_selection {
                    background: #171717 !important;
                    color: white !important;
                    border: 1px solid #262626 !important;
                    border-radius: 12px !important;
                    padding: 8px !important;
                    margin-top: 10px !important;
                    width: 100% !important;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
            `}</style>
        </div>
    );
}
