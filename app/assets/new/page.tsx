"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, User, MapPin, DollarSign, Calendar, Save, Hash } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

export default function NewAssetPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<{ departments: any[] }>({ departments: [] });

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        serialNumber: "",
        description: "",
        category: "Laptop",
        purchaseDate: new Date().toISOString().split("T")[0],
        purchasePrice: "",
        currentDepartmentId: "",
        assignedTo: "", // Now a text field
        condition: "GOOD",
        valuationMethod: "STRAIGHT_LINE",
        valuationRate: "5"
    });

    useEffect(() => {
        // Fetch departments for dropdown
        const token = localStorage.getItem('token');
        fetch("/api/assets/metadata", {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setMetadata({
                    departments: data.departments || []
                });
            })
            .catch(err => console.error("Failed to load metadata", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch("/api/assets", {
                method: "POST",
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
                showToast("Asset registered successfully!", "success");
                router.push("/assets");
                router.refresh();
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to create asset. Check if serial number is unique.", "error");
            }
        } catch (error) {
            showToast("An error occurred during registration", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <Link href="/assets" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--foreground)] transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Assets
            </Link>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">New Asset Registration</h2>
                    <p className="text-gray-500 mt-1">Add a new physical asset to the central inventory system.</p>
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
                                placeholder="e.g. Dell Latitude 5420"
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unique Serial Number</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    value={formData.serialNumber}
                                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    type="text"
                                    placeholder="S/N: ABC123XYZ"
                                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Condition</label>
                            <select
                                value={formData.condition}
                                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm outline-none"
                            >
                                <option value="EXCELLENT">Excellent (Brand New)</option>
                                <option value="GOOD">Good (Light Use)</option>
                                <option value="FAIR">Fair (Functional)</option>
                                <option value="POOR">Poor (Needs Repair)</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Detailed technical specs or unique identifiers..."
                            className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm outline-none resize-none px-4"
                        />
                    </div>
                </div>

                {/* Location & Ownership */}
                <div className="glass-card rounded-2xl p-6 border border-[var(--border)] space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-500" /> Location & Ownership
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Responsible Department</label>
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
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Person (Type Full Name)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.assignedTo}
                                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                    placeholder="e.g. Tendai Musarurwa"
                                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financials */}
                <div className="glass-card rounded-2xl p-6 border border-[var(--border)] space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-500" /> Financial & Valuation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    value={formData.purchaseDate}
                                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    type="date"
                                    className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Price (USD)</label>
                            <input
                                required
                                value={formData.purchasePrice}
                                onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Depreciation Period (Years)</label>
                            <input
                                required
                                value={formData.valuationRate}
                                onChange={e => setFormData({ ...formData, valuationRate: e.target.value })}
                                type="number"
                                placeholder="e.g. 5"
                                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm outline-none"
                            />
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
                        {loading ? "Processing..." : <><Save className="w-4 h-4" /> Finalize Registration</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
