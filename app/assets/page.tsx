import Link from 'next/link';
import db from '@/lib/db';
import { Package, Search, Plus, Filter, ArrowUpDown } from 'lucide-react';

import AssetFilterBar from '@/components/AssetFilterBar';

export default async function AssetsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
    const params = await searchParams;
    const { q, category, status } = params;

    let query = `
        SELECT a.*, d.name as departmentName 
        FROM Asset a
        LEFT JOIN Department d ON a.currentDepartmentId = d.id
        WHERE 1=1
    `;
    const sqlParams: any[] = [];

    if (q) {
        query += " AND (a.name LIKE ? OR a.id LIKE ?)";
        sqlParams.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
        query += " AND a.category = ?";
        sqlParams.push(category);
    }
    if (status) {
        query += " AND a.status = ?";
        sqlParams.push(status);
    }

    query += " ORDER BY a.createdAt DESC";

    const assets = db.prepare(query).all(...sqlParams) as any[];
    const categoryRows = db.prepare("SELECT DISTINCT category FROM Asset").all() as { category: string }[];
    const categories = categoryRows.map(r => r.category);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Asset Inventory</h2>
                    <p className="text-gray-500 mt-1">Manage and track all institutional assets across campuses.</p>
                </div>
                <Link href="/assets/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20">
                    <Plus className="w-4 h-4" /> Add New Asset
                </Link>
            </div>

            <AssetFilterBar categories={categories} />

            {/* Assets Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-[var(--border)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">
                                    <div className="flex items-center gap-2">Asset <ArrowUpDown className="w-3 h-3" /></div>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Category</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Department</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {assets.length > 0 ? assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-[var(--accent)]/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Link href={`/assets/${asset.id}`} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">{asset.name}</p>
                                                <p className="text-xs text-gray-500">{asset.id}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-[var(--accent)] rounded-md text-xs font-medium text-gray-400">
                                            {asset.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-400 font-medium">{asset.departmentName || 'Not Assigned'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${asset.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                                            asset.status === 'MISSING' ? 'bg-rose-500/10 text-rose-500' :
                                                'bg-gray-500/10 text-gray-500'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${asset.status === 'ACTIVE' ? 'bg-emerald-500' :
                                                asset.status === 'MISSING' ? 'bg-rose-500' :
                                                    'bg-gray-500'
                                                }`} />
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/assets/${asset.id}`} className="text-sm font-semibold text-blue-500 hover:text-blue-400">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package className="w-12 h-12 text-[var(--border)]" />
                                            <p className="text-gray-500">No assets found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
