import Link from 'next/link';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import {
    ArrowLeft, Calendar, MapPin, History, BarChart,
    Edit, Trash2, QrCode, ClipboardCheck
} from 'lucide-react';
import Timeline from '@/components/Timeline';

export default async function AssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const asset = db.prepare(`
        SELECT a.*, d.name as departmentName, u.name as assignedUserName, v.method, v.rate, v.currentBookValue, v.accumulatedDepreciation
        FROM Asset a
        LEFT JOIN Department d ON a.currentDepartmentId = d.id
        LEFT JOIN User u ON a.assignedUserId = u.id
        LEFT JOIN Valuation v ON v.assetId = a.id
        WHERE a.id = ?
    `).get(id) as any;

    if (!asset) return notFound();

    const movements = db.prepare(`
        SELECT m.*, fd.name as fromDept, td.name as toDept, ru.name as requestedBy
        FROM AssetMovement m
        LEFT JOIN Department fd ON m.fromDepartmentId = fd.id
        LEFT JOIN Department td ON m.toDepartmentId = td.id
        LEFT JOIN User ru ON m.requestedById = ru.id
        WHERE m.assetId = ?
        ORDER BY m.createdAt DESC
    `).all(id) as any[];

    // Map movements to timeline format
    const timelineEvents = movements.map(m => ({
        id: m.id,
        title: `Transfer ${m.status}`,
        description: `From ${m.fromDept || 'N/A'} to ${m.toDept}. Requested by ${m.requestedBy}`,
        time: new Date(m.createdAt).toLocaleDateString(),
        status: m.status === 'APPROVED' ? 'completed' : m.status === 'PENDING' ? 'pending' : 'failed'
    }));

    // Add creation event
    timelineEvents.push({
        id: 'initial',
        title: 'Asset Registered',
        description: 'Asset added to the registration system.',
        time: new Date(asset.createdAt).toLocaleDateString(),
        status: 'completed'
    });

    return (
        <div className="space-y-6">
            <Link href="/assets" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--foreground)] transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Assets
            </Link>

            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${asset.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                            }`}>
                            {asset.status}
                        </span>
                        <span className="text-gray-500 text-sm font-mono">{asset.id}</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">{asset.name}</h2>
                    <p className="text-gray-500 mt-2 max-w-2xl">{asset.description || 'No description provided for this asset.'}</p>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none px-4 py-2 border border-[var(--border)] rounded-xl text-sm font-medium hover:bg-[var(--accent)] transition-colors flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                        <QrCode className="w-4 h-4" /> Generate QR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Information Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card rounded-2xl p-6 border border-[var(--border)]">
                            <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Acquisition Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Purchase Date</p>
                                    <p className="text-[var(--foreground)] font-medium">{new Date(asset.purchaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Purchase Price</p>
                                    <p className="text-[var(--foreground)] font-medium">${asset.purchasePrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6 border border-[var(--border)]">
                            <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Current Location
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Department</p>
                                    <p className="text-[var(--foreground)] font-medium">{asset.departmentName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Custodian / Assigned User</p>
                                    <p className="text-[var(--foreground)] font-medium">{asset.assignedUserName || 'Unassigned'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-[var(--border)]">
                        <h3 className="text-sm font-semibold text-gray-400 mb-6 flex items-center gap-2">
                            <BarChart className="w-4 h-4" /> Valuation & Depreciation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center md:text-left">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Current Book Value</p>
                                <p className="text-2xl font-bold text-blue-500">${Math.round(asset.currentBookValue).toLocaleString()}</p>
                            </div>
                            <div className="text-center md:text-left border-y md:border-y-0 md:border-x border-[var(--border)] py-4 md:py-0 md:px-8">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Depreciation</p>
                                <p className="text-2xl font-bold text-rose-500">-${Math.round(asset.accumulatedDepreciation).toLocaleString()}</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Valuation Method</p>
                                <p className="text-lg font-semibold text-[var(--foreground)]">{asset.method === 'STRAIGHT_LINE' ? 'Straight Line' : 'Reducing Balance'}</p>
                                <p className="text-xs text-gray-400">{asset.rate} Year Lifespan</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Component */}
                    <div className="glass-card rounded-2xl p-6 border border-[var(--border)]">
                        <h3 className="text-sm font-semibold text-gray-400 mb-6 flex items-center gap-2">
                            <History className="w-4 h-4" /> Audit Trait & Lifecycle
                        </h3>
                        <Timeline events={timelineEvents} />
                    </div>
                </div>

                {/* Sidebar Cards */}
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
                        <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors">
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
                            <button className="flex-1 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl text-[10px] font-bold transition-colors">
                                FLAG MISSING
                            </button>
                            <button className="flex-1 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl text-[10px] font-bold transition-colors">
                                MARK SCRAP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
