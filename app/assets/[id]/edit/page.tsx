"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, User, MapPin, DollarSign, Calendar, Save, Hash, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [metadata, setMetadata] = useState<{ departments: any[] }>({ departments: [] });

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        serialNumber: "",
        description: "",
        category: "Laptop",
        purchaseDate: "",
        purchasePrice: "",
        currentDepartmentId: "",
        assignedTo: "",
        condition: "GOOD",
        valuationRate: "5"
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch asset and metadata
        const fetchData = async () => {
            try {
                const [assetRes, metaRes] = await Promise.all([
                    fetch(`/api/assets/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch("/api/assets/metadata", { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (assetRes.ok && metaRes.ok) {
                    const asset = await assetRes.json();
                    const meta = await metaRes.json();

                    setMetadata({ departments: meta.departments || [] });
                    setFormData({
                        name: asset.name || "",
                        serialNumber: asset.serialNumber || "",
                        description: asset.description || "",
                        category: asset.category || "Laptop",
                        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split("T")[0] : "",
                        purchasePrice: asset.purchasePrice?.toString() || "",
                        currentDepartmentId: asset.currentDepartmentId || "",
                        assignedTo: asset.assignedTo || "",
                        condition: asset.condition || "GOOD",
                        valuationRate: asset.rate?.toString() || "5"
                    });
                } else {
                    showToast("Failed to load asset data", "error");
                    router.push("/assets");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                showToast("An error occurred loading the page", "error");
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [id, router, showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/assets/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    purchasePrice: parseFloat(formData.purchasePrice),
                    valuationRate: parseFloat(formData.valuationRate),
                    purchaseDate: new Date(formData.purchaseDate).toISOString()
                }),
            });

            if (res.ok) {
                showToast("Asset updated successfully!", "success");
                router.push(`/assets/${id}`);
                router.refresh();
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to update asset.", "error");
            }
        } catch (error) {
            showToast("An error occurred during update", "error");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium">Retrieving secure asset records...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <Link href={`/assets/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--foreground)] transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Details
            </Link>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Edit Asset Record</h2>
                    <p className="text-gray-500 mt-1">Modify information for asset ID: <span className="font-mono text-blue-500">{id}</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-[var(--foreground)]">
                {/* General Info */}
                <div className="glass-card rounded-2xl p-6 border border-[var(--border)] space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-blue-500" /> General Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                type="text"
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Serial Number</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    value={formData.serialNumber}
                                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    type="text"
                                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status & Condition */}
                <div className="glass-card rounded-2xl p-6 border border-[var(--border)] space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-blue-500" /> Status & State
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Condition</label>
                            <select
                                value={formData.condition}
                                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm outline-none"
                            >
                                <option value="EXCELLENT">Excellent</option>
                                <option value="GOOD">Good</option>
                                <option value="FAIR">Fair</option>
                                <option value="POOR">Poor</option>
                                <option value="SCRAP">Scrap</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm outline-none"
                            >
                                <option>Laptop</option>
                                <option>Desktop</option>
                                <option>Network</option>
                                <option>Projectors</option>
                                <option>Furniture</option>
                                <option>Vehicles</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location & Ownership */}
                <div className="glass-card rounded-2xl p-6 border border-[var(--border)] space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-500" /> Location & Ownership
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                            <select
                                required
                                value={formData.currentDepartmentId}
                                onChange={e => setFormData({ ...formData, currentDepartmentId: e.target.value })}
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm outline-none"
                            >
                                <option value="">Select Department</option>
                                {metadata.departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Person</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.assignedTo}
                                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-[var(--border)] rounded-xl font-medium text-sm hover:bg-[var(--accent)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
