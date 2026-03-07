"use client";

import { useState, useEffect } from "react";
import {
    Edit, QrCode, ClipboardCheck, Trash2,
    X, Check, Download,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

interface AssetActionsProps {
    asset: {
        id: string;
        name: string;
        status: string;
        condition: string;
        qrCodeHash: string;
    };
}

// Custom hook for shared logic
function useAssetLogic(asset: any) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [newCondition, setNewCondition] = useState(asset.condition);

    const updateAsset = async (data: any, actionName: string) => {
        setLoading(actionName);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/assets/${asset.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                showToast(`Asset ${actionName} successful`, "success");
                router.refresh();
                setShowAuditModal(false);
            } else {
                const err = await res.json();
                showToast(err.error || `Failed to ${actionName}`, "error");
            }
        } catch (error) {
            showToast(`An error occurred during ${actionName}`, "error");
        } finally {
            setLoading(null);
        }
    };

    return {
        loading,
        showQrModal, setShowQrModal,
        showAuditModal, setShowAuditModal,
        newCondition, setNewCondition,
        updateAsset,
        router
    };
}

export function AssetTopActions({ asset }: AssetActionsProps) {
    const { router } = useAssetLogic(asset);

    return (
        <div className="flex gap-3 w-full lg:w-auto">
            <button
                onClick={() => router.push(`/assets/${asset.id}/edit`)}
                className="flex-1 lg:flex-none px-4 py-2 border border-[var(--border)] rounded-xl text-sm font-medium hover:bg-[var(--accent)] transition-colors flex items-center justify-center gap-2"
            >
                <Edit className="w-4 h-4" /> Edit
            </button>
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-qr-modal'))}
                className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
                <QrCode className="w-4 h-4" /> Generate QR
            </button>
        </div>
    );
}

export function AssetSidebarActions({ asset }: AssetActionsProps) {
    const { loading, updateAsset } = useAssetLogic(asset);

    const handleFlagMissing = () => {
        if (confirm("Are you sure you want to flag this asset as MISSING?")) {
            updateAsset({ status: "MISSING" }, "flagged as missing");
        }
    };

    const handleMarkScrap = () => {
        if (confirm("Are you sure you want to mark this asset as SCRAP?")) {
            updateAsset({ status: "SCRAP", condition: "SCRAP" }, "marked as scrap");
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5">
                <h3 className="text-sm font-semibold text-emerald-500 mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Condition Report
                </h3>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className="font-bold text-[var(--foreground)]">{asset.condition}</span>
                </div>
                <div className="w-full bg-emerald-500/20 h-2 rounded-full mb-6 overflow-hidden">
                    <div className={`h-full bg-emerald-500 rounded-full ${asset.condition === 'EXCELLENT' ? 'w-full' :
                        asset.condition === 'GOOD' ? 'w-[80%]' :
                            asset.condition === 'FAIR' ? 'w-[50%]' :
                                asset.condition === 'POOR' ? 'w-[20%]' : 'w-[5%]'
                        }`} />
                </div>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-audit-modal'))}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                >
                    RE-AUDIT ASSET
                </button>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5">
                <h3 className="text-sm font-semibold text-rose-500 mb-4 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Danger Zone
                </h3>
                <p className="text-xs text-rose-500/60 mb-4 leading-relaxed">
                    Marking an asset as SCRAP or MISSING will stop active depreciation and trigger an investigation report.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handleFlagMissing}
                        disabled={loading === "flagged as missing"}
                        className="flex-1 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl text-[10px] font-bold transition-colors disabled:opacity-50"
                    >
                        {loading === "flagged as missing" ? "..." : "FLAG MISSING"}
                    </button>
                    <button
                        onClick={handleMarkScrap}
                        disabled={loading === "marked as scrap"}
                        className="flex-1 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl text-[10px] font-bold transition-colors disabled:opacity-50"
                    >
                        {loading === "marked as scrap" ? "..." : "MARK SCRAP"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function AssetModals({ asset }: AssetActionsProps) {
    const {
        loading,
        showQrModal, setShowQrModal,
        showAuditModal, setShowAuditModal,
        newCondition, setNewCondition,
        updateAsset
    } = useAssetLogic(asset);

    useEffect(() => {
        const openQr = () => setShowQrModal(true);
        const openAudit = () => setShowAuditModal(true);
        window.addEventListener('open-qr-modal', openQr);
        window.addEventListener('open-audit-modal', openAudit);
        return () => {
            window.removeEventListener('open-qr-modal', openQr);
            window.removeEventListener('open-audit-modal', openAudit);
        };
    }, []);

    return (
        <>
            {showQrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-[var(--accent)] rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Asset QR Identity</h3>
                                <p className="text-sm text-gray-500">Official Tag for {asset.name}</p>
                            </div>

                            <div className="bg-white p-4 rounded-3xl inline-block shadow-inner">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${asset.qrCodeHash}`}
                                    alt="Asset QR Code"
                                    className="w-48 h-48"
                                />
                            </div>

                            <div className="bg-[var(--accent)] p-4 rounded-2xl text-left border border-[var(--border)]">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Electronic ID</p>
                                <p className="text-xs font-mono break-all text-blue-400">{asset.qrCodeHash}</p>
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20"
                            >
                                <Download className="w-4 h-4" /> Print Asset Label
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAuditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowAuditModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-[var(--accent)] rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Re-Audit Condition</h3>
                                <p className="text-sm text-gray-500">Update the physical state of this asset.</p>
                            </div>

                            <div className="space-y-3">
                                {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'SCRAP'].map((cond) => (
                                    <button
                                        key={cond}
                                        onClick={() => setNewCondition(cond)}
                                        className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${newCondition === cond
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-[var(--border)] bg-[var(--accent)] hover:border-gray-500'
                                            }`}
                                    >
                                        <span className="font-medium text-sm">{cond}</span>
                                        {newCondition === cond && <Check className="w-4 h-4 text-blue-500" />}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => updateAsset({ condition: newCondition }, "audit")}
                                disabled={loading === "audit"}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading === "audit" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Audit Report"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
