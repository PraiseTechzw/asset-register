import Link from 'next/link';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import {
    ArrowLeft, Calendar, MapPin, History, BarChart
} from 'lucide-react';
import Timeline from '@/components/Timeline';
import { AssetTopActions, AssetSidebarActions, AssetModals } from '@/components/AssetActions';

export default async function AssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const assetResult = await db.execute({
        sql: `
            SELECT a.*, d.name as departmentName, v.method, v.rate, v.currentBookValue, v.accumulatedDepreciation
            FROM Asset a
            LEFT JOIN Department d ON a.currentDepartmentId = d.id
            LEFT JOIN Valuation v ON v.assetId = a.id
            WHERE a.id = ?
        `,
        args: [id]
    });
    const asset = assetResult.rows[0] as any;

    if (!asset) return notFound();

    // Live calculation of depreciation
    const purchaseDate = new Date(asset.purchaseDate);
    const now = new Date();
    const ageInYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    let currentBookValue = asset.purchasePrice;
    let accumulatedDepreciation = 0;

    if (asset.method === 'STRAIGHT_LINE') {
        const annualDepreciation = asset.purchasePrice / (asset.rate || 5);
        accumulatedDepreciation = Math.min(asset.purchasePrice, annualDepreciation * ageInYears);
        currentBookValue = Math.max(0, asset.purchasePrice - accumulatedDepreciation);
    } else {
        // Reducing Balance (approximate for now)
        const ratePerYear = 0.20; // 20%
        currentBookValue = asset.purchasePrice * Math.pow(1 - ratePerYear, ageInYears);
        accumulatedDepreciation = asset.purchasePrice - currentBookValue;
    }

    // Override table values with live calculations
    asset.currentBookValue = currentBookValue;
    asset.accumulatedDepreciation = accumulatedDepreciation;

    const movementsResult = await db.execute({
        sql: `
            SELECT m.*, fd.name as fromDept, td.name as toDept, ru.name as requestedBy
            FROM AssetMovement m
            LEFT JOIN Department fd ON m.fromDepartmentId = fd.id
            LEFT JOIN Department td ON m.toDepartmentId = td.id
            LEFT JOIN User ru ON m.requestedById = ru.id
            WHERE m.assetId = ?
            ORDER BY m.createdAt DESC
        `,
        args: [id]
    });
    const movements = movementsResult.rows as any[];

    // Map movements to timeline format
    const timelineEvents: Array<{ id: string; title: string; description: string; time: string; status: 'completed' | 'pending' | 'failed' | 'current' }> = movements.map(m => ({
        id: m.id,
        title: `Transfer ${m.status}`,
        description: `From ${m.fromDept || 'N/A'} to ${m.toDept}. Requested by ${m.requestedBy}`,
        time: new Date(m.createdAt).toLocaleDateString(),
        status: (m.status === 'APPROVED' ? 'completed' : m.status === 'PENDING' ? 'pending' : 'failed') as 'completed' | 'pending' | 'failed' | 'current'
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
            <AssetModals asset={asset} />

            <Link href="/assets" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--foreground)] transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Assets
            </Link>

            <div className="flex flex-col gap-6">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${asset.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' :
                            asset.status === 'MISSING' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'
                            }`}>
                            {asset.status}
                        </span>
                        <span className="text-gray-500 text-xs font-mono break-all">{asset.id}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--foreground)]">{asset.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <p className="text-blue-500 font-bold text-sm uppercase tracking-widest border-r border-[var(--border)] pr-3">Serial: {asset.serialNumber || 'UNCODED'}</p>
                        <p className="text-gray-500 text-sm">{asset.category}</p>
                    </div>
                    <p className="text-gray-500 mt-4 text-sm leading-relaxed">{asset.description || 'No description provided for this asset.'}</p>
                </div>

                <AssetTopActions asset={asset} />
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
                                    <p className="text-[var(--foreground)] font-medium">
                                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Purchase Price</p>
                                    <p className="text-[var(--foreground)] font-medium">${(asset.purchasePrice || 0).toLocaleString()}</p>
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
                                    <p className="text-[var(--foreground)] font-medium">{asset.departmentName || 'Not Assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Custodian / Assigned Person</p>
                                    <p className="text-[var(--foreground)] font-medium">{asset.assignedTo || 'Unassigned'}</p>
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
                                <p className="text-2xl font-bold text-blue-500">${Math.round(asset.currentBookValue || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center md:text-left border-y md:border-y-0 md:border-x border-[var(--border)] py-4 md:py-0 md:px-8">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Depreciation</p>
                                <p className="text-2xl font-bold text-rose-500">-${Math.round(asset.accumulatedDepreciation || 0).toLocaleString()}</p>
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
                            <History className="w-4 h-4" /> Audit Trail & Lifecycle
                        </h3>
                        <Timeline events={timelineEvents} />
                    </div>
                </div>

                {/* Sidebar Actions */}
                <AssetSidebarActions asset={asset} />
            </div>
        </div>
    );
}
