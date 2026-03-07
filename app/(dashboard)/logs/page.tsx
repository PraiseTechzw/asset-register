import db from '@/lib/db';
import { History, User, Activity, MapPin, Search } from 'lucide-react';
import { LogActivity } from '@/components/Timeline'; // Assuming Timeline components exist or similar

export default async function LogsPage() {
    const logs = db.prepare(`
        SELECT l.*, u.name as userName 
        FROM AuditLog l
        LEFT JOIN User u ON l.userId = u.id
        ORDER BY l.timestamp DESC
        LIMIT 100
    `).all() as any[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tight text-white uppercase">System_Logs</h2>
                    <p className="text-white/30 text-xs font-mono tracking-widest mt-1">Live Activity Stream • Node-01</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search hash..."
                            className="bg-white/[0.03] border border-white/10 rounded-xl py-2 px-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                </div>
            </div>

            <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden bg-white/[0.01]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Timestamp</th>
                            <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Authorized_User</th>
                            <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Protocol_Action</th>
                            <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">Entity_Target</th>
                            <th className="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-white/30 uppercase text-right">Metadata</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-white font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        <span className="text-white/20 text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-xs font-bold leading-none">{log.userName || "SYSTEM"}</span>
                                            <span className="text-[10px] text-white/20 font-mono italic">{log.ipAddress || "0.0.0.0"}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase border ${log.action.includes('FAILED') || log.action.includes('DENIED')
                                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                            : log.action.includes('QR')
                                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                        }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-white/80 text-xs font-medium">{log.entityType}</span>
                                        <span className="text-white/20 text-[10px] font-mono">{log.entityId.slice(0, 18)}...</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 group-hover:border-white/20 transition-all cursor-help" title={log.details}>
                                        <Activity className="w-3 h-3 text-white/30" />
                                        <span className="text-[10px] text-white/40 font-mono">JSON.DAT</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-white/20">
                        <History className="w-12 h-12 mb-4" />
                        <p className="text-sm font-bold tracking-widest">NO LOG_STREAM DETECTED</p>
                    </div>
                )}
            </div>
        </div>
    );
}
