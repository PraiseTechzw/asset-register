"use client";

import React, { useState, useEffect } from 'react';
import { ScanLine, AlertTriangle, CheckCircle, WifiOff, X } from 'lucide-react';
import AssetCard from '@/components/AssetCard';

export default function ScannerPage() {
    const [scanning, setScanning] = useState(true);
    const [scanResult, setScanResult] = useState<'success' | 'not-found' | null>(null);

    // Simulate scanning for demo purposes
    useEffect(() => {
        if (scanning) {
            const timer = setTimeout(() => {
                setScanning(false);
                setScanResult('success');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [scanning]);

    const handleReset = () => {
        setScanResult(null);
        setScanning(true);
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col sm:relative sm:z-0 sm:min-h-[80vh] sm:rounded-2xl sm:overflow-hidden sm:border sm:border-[var(--border)]">
            {/* Mobile Header / Desktop Info */}
            <div className="h-16 flex items-center justify-between px-6 bg-[var(--accent)] border-b border-[var(--border)] z-10 w-full relative sm:hidden">
                <h2 className="text-lg font-bold text-white">QR Code Scanner</h2>
                <div className="flex items-center gap-2 text-rose-400 text-xs font-medium px-2 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                    <WifiOff className="w-3 h-3" />
                    Offline
                </div>
            </div>

            {/* Main Scanner Viewport */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
                {/* Placeholder for actual Camera Stream */}
                <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
                <img src="https://images.unsplash.com/photo-1588508065123-287b28e0139b?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30" alt="camera background view" />

                {/* Scanner UI Overlay */}
                {scanning && (
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Scanner Frame */}
                        <div className="w-64 h-64 border-2 border-blue-500/50 rounded-3xl relative overflow-hidden backdrop-blur-sm">
                            {/* Corner markers */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-3xl"></div>

                            {/* Scanning animation line */}
                            <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] absolute top-1/2 left-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-2">
                            <ScanLine className="w-8 h-8 text-blue-500 animate-pulse" />
                            <p className="text-blue-500 font-mono text-sm tracking-widest text-shadow">ALIGN QR CODE</p>
                        </div>
                    </div>
                )}

                {/* Success Overlay */}
                {scanResult === 'success' && !scanning && (
                    <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Verified Successfully</h3>
                        <p className="text-gray-400 mb-8">Asset match found in the database.</p>

                        <div className="w-full max-w-sm">
                            <AssetCard
                                id="AST-2024-002"
                                name="Epson Projector"
                                category="Electronics"
                                department="Room 304"
                                condition="Optimal"
                                lastAudit="Just now"
                            />
                        </div>

                        <div className="flex gap-4 mt-8 w-full max-w-sm">
                            <button onClick={handleReset} className="flex-1 py-3 bg-[var(--accent)] hover:bg-[#262626] border border-[var(--border)] rounded-xl text-white font-medium transition-colors">
                                Rescan
                            </button>
                            <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors">
                                Update Asset
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Overlay */}
                {scanResult === 'not-found' && !scanning && (
                    <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Asset Not Found</h3>
                        <p className="text-gray-400 mb-8 text-center max-w-sm">This QR code does not match any movable asset registered in the current database partition.</p>

                        <div className="flex gap-4 mt-4 w-full max-w-sm">
                            <button onClick={handleReset} className="flex-1 py-3 bg-[var(--accent)] hover:bg-[#262626] border border-[var(--border)] rounded-xl text-white font-medium transition-colors">
                                Try Again
                            </button>
                            <button className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-colors">
                                Flag Issue
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Offline Queue UI */}
            <div className="bg-[var(--accent)] border-t border-[var(--border)] p-4 flex justify-between items-center sm:hidden">
                <div>
                    <h4 className="font-semibold text-white text-sm">Offline Queue</h4>
                    <p className="text-xs text-gray-400">Syncs when reconnected</p>
                </div>
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/20">
                    3 Items
                </div>
            </div>

            <style>{`
        @keyframes scan {
          0% { top: 0; box-shadow: 0 0 5px #3b82f6; }
          50% { top: 100%; box-shadow: 0 0 20px #3b82f6; }
          100% { top: 0; box-shadow: 0 0 5px #3b82f6; }
        }
      `}</style>
        </div>
    );
}
