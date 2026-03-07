import db from '@/lib/db';
import { AlertTriangle, MapPin, Calendar, ClipboardCheck, Info } from 'lucide-react';

export default async function AuditsPage({
    searchParams,
}: {
    searchParams: Promise<{ days?: string }>;
}) {
    const params = await searchParams;
    const days = parseInt(params.days || "30", 10);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    const thresholdISO = thresholdDate.toISOString();

    // 1. Assets not scanned in X days
    const unscanned = db.prepare(`
        SELECT a.*, d.name as deptName 
        FROM Asset a
        LEFT JOIN Department d ON a.currentDepartmentId = d.id
        WHERE a.status = 'ACTIVE' 
        AND a.id NOT IN (
            SELECT entityId FROM AuditLog 
            WHERE action = 'QR_SCANNED' 
            AND timestamp >= ?
        )
    `).all(thresholdISO) as any[];

    // 2. Missing Assets
    const missing = db.prepare(`
        SELECT a.*, d.name as deptName 
        FROM Asset a
        LEFT JOIN Department d ON a.currentDepartmentId = d.id
        WHERE a.status = 'MISSING'
    `).all() as any[];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Audit & Compliance</h2>
                    <p className="text-gray-500 mt-1">Identify discrepancies and assets requiring immediate verification.</p>
                </div>
                <div className="flex bg-[var(--accent)] p-1 rounded-xl border border-[var(--border)] overflow-hidden">
                    {[7, 30, 90].map(d => (
                        <a
                            key={d}
                            href={`/audits?days=${d}`}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${days === d ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {d} DAYS
                        </a>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unscanned Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-lg text-[var(--foreground)]">Unverified ({'>'}{days} days)</h3>
                        <span className="ml-auto px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-md">{unscanned.length}</span>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {unscanned.map(a => (
                            <div key={a.id} className="glass-card p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-amber-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-[var(--foreground)]">{a.name}</h4>
                                    <span className="text-[10px] font-mono text-gray-500">{a.id}</span>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.deptName}</span>
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
                        <span className="ml-auto px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-md">{missing.length}</span>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {missing.map(a => (
                            <div key={a.id} className="glass-card p-4 rounded-xl border border-[var(--border)] border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-[var(--foreground)]">{a.name}</h4>
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter italic">REPORTED MISSING</span>
                                </div>
                                <p className="text-xs text-rose-300 font-medium mb-3 leading-relaxed">This asset was flagged during the last scan at {a.deptName}.</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-rose-500/60 font-mono italic">ID# {a.id}</span>
                                    <button className="px-3 py-1 bg-white text-rose-600 rounded-lg text-[10px] font-black hover:bg-rose-50 text-rose-600 shadow-sm transition-all">
                                        INITIATE RECOVERY
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all">
                    GENERATE AUDIT REPORT
                </button>
            </div>
        </div>
    );
}
