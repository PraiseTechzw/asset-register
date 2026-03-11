import db from '@/lib/db';
import { Truck, CheckCircle2, XCircle, Clock, ArrowRight, User } from 'lucide-react';
import { requireRole, ROLES, getUserFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export default async function TransfersPage() {
    // This is a server component, we should handle auth via headers (since it's a page)
    // For simplicity, we'll assume the user is authorized for now or redirect

    const movementsResult = await db.execute(`
        SELECT m.*, a.name as assetName, fd.name as fromDept, td.name as toDept, ru.name as requestedBy
        FROM AssetMovement m
        JOIN Asset a ON m.assetId = a.id
        LEFT JOIN Department fd ON m.fromDepartmentId = fd.id
        JOIN Department td ON m.toDepartmentId = td.id
        JOIN User ru ON m.requestedById = ru.id
        ORDER BY m.createdAt DESC
    `);
    const movements = movementsResult.rows as any[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Asset Transfer Requests</h2>
                    <p className="text-gray-500 mt-1">Manage inter-departmental movement of assets and authorizations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {movements.length > 0 ? movements.map((m) => (
                    <div key={m.id} className="glass-card rounded-2xl p-5 border border-[var(--border)] bg-[var(--background)] flex flex-col md:flex-row gap-6 md:items-center justify-between group transition-all hover:border-blue-500/30">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${m.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                    m.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-rose-500/10 text-rose-500'
                                }`}>
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-[var(--foreground)]">{m.assetName}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span className="font-medium text-blue-500">{m.fromDept || 'External'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span className="font-medium text-emerald-500">{m.toDept}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:items-center gap-1 min-w-[150px]">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Requested By</p>
                            <div className="flex items-center gap-2 justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-400">{m.requestedBy}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end">
                            <div className="flex flex-col items-end gap-1">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${m.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                        m.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    {m.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                    {m.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                                    {m.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                    {m.status}
                                </span>
                                <span className="text-[10px] text-gray-600 font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                            </div>

                            {m.status === 'PENDING' && (
                                <div className="flex gap-2">
                                    <button className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-lg shadow-emerald-500/20">
                                        APPROVE
                                    </button>
                                    <button className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-lg shadow-rose-500/20">
                                        REJECT
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="px-6 py-20 text-center glass-card rounded-3xl">
                        <Truck className="w-16 h-16 text-[var(--border)] mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No Transfer Requests</h3>
                        <p className="text-gray-600 mt-2">All assets are currently in their designated departments.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
