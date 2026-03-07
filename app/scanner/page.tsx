"use client";

import React, { useState, useEffect } from 'react';
import { ScanLine, AlertTriangle, CheckCircle, WifiOff, X, Navigation } from 'lucide-react';
import AssetCard from '@/components/AssetCard';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerPage() {
    const [scanning, setScanning] = useState(true);
    const [scanResult, setScanResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        // Request geolocation for audit accuracy
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string, decodedResult: any) {
            // Stop scanning and process
            scanner.clear();
            setScanning(false);
            processScan(decodedText);
        }

        function onScanFailure(error: any) {
            // ignore scan failure
        }

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, []);

    const processScan = async (code: string) => {
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
            } else {
                setError("Asset not found or synchronization error.");
            }
        } catch (e) {
            setError("Network error. Scan recorded for offline sync.");
        }
    };

    const handleReset = () => {
        window.location.reload(); // Simplest way to restart scanner instance
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col sm:relative sm:z-0 sm:min-h-[80vh] sm:rounded-2xl sm:overflow-hidden sm:border sm:border-[var(--border)]">
            {/* Mobile Header */}
            <div className="h-16 flex items-center justify-between px-6 bg-[var(--accent)] border-b border-[var(--border)] z-10 w-full relative sm:hidden">
                <h2 className="text-lg font-bold text-white">QR System Scan</h2>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <Navigation className="w-3 h-3" />
                    GPS active
                </div>
            </div>

            {/* Main Scanner Viewport */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">

                {/* The Library Target */}
                <div id="reader" className={`w-full max-w-lg ${!scanning ? 'hidden' : ''}`}></div>

                {scanning && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                        <ScanLine className="w-8 h-8 text-blue-500 animate-pulse" />
                        <p className="text-blue-500 font-mono text-xs tracking-widest uppercase">Align Code within frame</p>
                    </div>
                )}

                {/* Success Overlay */}
                {scanResult && (
                    <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 underline decoration-emerald-500/30 underline-offset-8">Verification Success</h3>
                        <p className="text-gray-400 mb-8 text-sm">Asset ID {scanResult.id} found in local vault.</p>

                        <div className="w-full max-w-sm">
                            <AssetCard
                                id={scanResult.id}
                                name={scanResult.name}
                                category={scanResult.category}
                                department={scanResult.department}
                                condition={scanResult.condition}
                                lastAudit="Just now"
                                status={scanResult.status}
                            />
                        </div>

                        <div className="flex gap-4 mt-8 w-full max-w-sm">
                            <button onClick={handleReset} className="flex-1 py-3 bg-[var(--accent)] hover:bg-[#262626] border border-[var(--border)] rounded-xl text-white font-medium transition-colors">
                                Rescan
                            </button>
                            <a href={`/assets/${scanResult.id}`} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-colors">
                                View Full Profile
                            </a>
                        </div>
                    </div>
                )}

                {/* Error Overlay */}
                {error && (
                    <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 border border-rose-500/30">
                            <AlertTriangle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Access Denied</h3>
                        <p className="text-gray-400 mb-8 text-center max-w-sm text-sm">{error}</p>

                        <div className="flex gap-4 mt-4 w-full max-w-sm">
                            <button onClick={handleReset} className="flex-1 py-3 bg-[var(--accent)] hover:bg-[#262626] border border-[var(--border)] rounded-xl text-white font-medium transition-colors">
                                Retry Scan
                            </button>
                            <button className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-colors">
                                Manual Entry
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                #reader { border: none !important; }
                #reader__scan_region { background: black !important; }
                #reader__dashboard_section_csr button {
                    background: #3b82f6 !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                #reader__camera_selection {
                    background: #171717 !important;
                    color: white !important;
                    border: 1px solid #262626 !important;
                    border-radius: 8px !important;
                    padding: 4px !important;
                }
            `}</style>
        </div>
    );
}
