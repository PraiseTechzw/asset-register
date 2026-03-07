"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, MapPin, Calendar, Info, Loader2, Download } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

function AuditsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    // Convert days from string to number, defaulting to 30
    const [days, setDays] = useState(parseInt(searchParams?.get("days") || "30", 10));
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const [data, setData] = useState({
        unscanned: [] as any[],
        missing: [] as any[],
        conditionDiscrepancies: [] as any[]
    });

    useEffect(() => {
        const fetchAudits = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/audits/discrepancies?days=${days}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const result = await res.json();
                    setData({
                        unscanned: result.discrepancies.unscanned || [],
                        missing: result.discrepancies.missing || [],
                        conditionDiscrepancies: result.discrepancies.conditionDiscrepancies || []
                    });
                } else if (res.status === 401 || res.status === 403) {
                    showToast("Unauthorized or forbidden access to audits.", "error");
                    if (res.status === 401) {
                        localStorage.removeItem('token');
                        router.push('/login');
                    }
                } else {
                    showToast("Failed to fetch audit data", "error");
                }
            } catch (error) {
                console.error("Audits fetch error:", error);
                showToast("An error occurred loading audits", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchAudits();
    }, [days, router, showToast]);

    const handleGenerateReport = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setExporting(true);
        try {
            const res = await fetch('/api/reports/export', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `asset-report-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                showToast("Report generated successfully", "success");
            } else {
                showToast("Failed to generate report", "error");
            }
        } catch (error) {
            console.error("Export error:", error);
            showToast("Error generating report", "error");
        } finally {
            setExporting(false);
        }
    };

    const handleInitiateRecovery = (assetId: string) => {
        router.push(`/assets/${assetId}`);
        showToast(`Navigated to asset ${assetId} for recovery actions.`, "info");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Audit & Compliance</h2>
                    <p className="text-gray-500 mt-1">Identify discrepancies and assets requiring immediate verification.</p>
                </div>
                <div className="flex bg-[var(--accent)] p-1 rounded-xl border border-[var(--border)] overflow-hidden">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => {
                                setDays(d);
                                router.push(`/audits?days=${d}`);
                            }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${days === d ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-[var(--foreground)]'
                                }`}
                        >
                            {d} DAYS
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-gray-500 font-medium">Analyzing audit compliance...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Unscanned Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Calendar className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-lg text-[var(--foreground)]">Unverified ({'>'}{days} days)</h3>
                            <span className="ml-auto px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-md">{data.unscanned.length}</span>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.unscanned.length === 0 ? (
                                <p className="text-sm text-gray-400 p-4 text-center">No unverified assets found for this period.</p>
                            ) : data.unscanned.map(a => (
                                <div key={a.id} className="glass-card p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-amber-500/30 transition-colors cursor-pointer" onClick={() => router.push(`/assets/${a.id}`)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-[var(--foreground)]">{a.name}</h4>
                                        <span className="text-[10px] font-mono text-gray-500">{a.id}</span>
                                    </div>
                                    <div className="flex gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.departmentName || 'Unassigned'}</span>
                                        <span className="flex items-center gap-1 text-amber-500/80 font-medium">Last seen: Never/Old</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Missing Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            <h3 className="font-bold text-lg text-[var(--foreground)]">Missing Assets</h3>
                            <span className="ml-auto px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-md">{data.missing.length}</span>
                        </div>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.missing.length === 0 ? (
                                <p className="text-sm text-gray-400 p-4 text-center">No missing assets reported.</p>
                            ) : data.missing.map(a => (
                                <div key={a.id} className="glass-card p-4 rounded-xl border border-[var(--border)] border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => router.push(`/assets/${a.id}`)}>
                                        <h4 className="font-bold text-[var(--foreground)]">{a.name}</h4>
                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter italic">REPORTED MISSING</span>
                                    </div>
                                    <p className="text-xs text-rose-300 font-medium mb-3 leading-relaxed">This asset was flagged during the last scan at {a.departmentName || 'Unknown'}.</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-rose-500/60 font-mono italic">ID# {a.id}</span>
                                        <button
                                            onClick={() => handleInitiateRecovery(a.id)}
                                            className="px-3 py-1 bg-white text-rose-600 rounded-lg text-[10px] font-black hover:bg-rose-50 shadow-sm transition-all"
                                        >
                                            INITIATE RECOVERY
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Status Panel */}
            <div className="glass-card rounded-2xl p-6 border border-blue-500/20 bg-blue-500/5 mt-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                    <Info className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-lg text-blue-400">Periodic Audit Schedule</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-xl leading-relaxed">
                        According to institutional policy, all portable electronics must be scanned every 14 days.
                        Furniture and fixed equipment require semi-annual verification (180 days).
                    </p>
                </div>
                <button
                    onClick={handleGenerateReport}
                    disabled={exporting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    GENERATE AUDIT REPORT
                </button>
            </div>
        </div>
    );
}

export default function AuditsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <AuditsContent />
        </Suspense>
    );
}
