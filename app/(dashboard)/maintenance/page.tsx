import db from "@/lib/db";
import { Wrench, Calendar, CheckCircle, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function MaintenancePage() {
    const jobs = db.prepare(`
    SELECT m.*, a.name as assetName, a.serialNumber
    FROM MaintenanceJob m
    JOIN Asset a ON m.assetId = a.id
    ORDER BY m.scheduledDate ASC
  `).all() as any[];

    const stats = {
        pending: jobs.filter(j => j.status === 'SCHEDULED' && new Date(j.scheduledDate) > new Date()).length,
        overdue: jobs.filter(j => j.status === 'SCHEDULED' && new Date(j.scheduledDate) <= new Date()).length,
        completed: jobs.filter(j => j.status === 'COMPLETED').length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Maintenance <span className="text-blue-500">Center</span></h1>
                    <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase mt-1">Institutional Asset Lifecycle Management</p>
                </div>
                <Link href="/maintenance/new" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    Schedule Service
                </Link>
            </div>

            {/* Stats Cluster */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Clock className="w-24 h-24 text-white" />
                    </div>
                    <p className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-4">Upcoming</p>
                    <p className="text-4xl font-black text-white mb-1">{stats.pending}</p>
                    <p className="text-xs text-white/20 font-bold uppercase">Scheduled Services</p>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.03] to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <AlertTriangle className="w-24 h-24 text-rose-500" />
                    </div>
                    <p className="text-[10px] font-black text-rose-500/60 tracking-widest uppercase mb-4 text-glow">Critical/Overdue</p>
                    <p className="text-4xl font-black text-rose-500 mb-1">{stats.overdue}</p>
                    <p className="text-xs text-rose-500/30 font-bold uppercase">Attention Required</p>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <CheckCircle className="w-24 h-24 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-emerald-500/60 tracking-widest uppercase mb-4">Finalized</p>
                    <p className="text-4xl font-black text-emerald-500 mb-1">{stats.completed}</p>
                    <p className="text-xs text-emerald-500/30 font-bold uppercase">Completed This Month</p>
                </div>
            </div>

            {/* Schedule Table */}
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-black tracking-widest text-white/60 uppercase flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" /> Active Maintenance Schedule
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Asset Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Scheduled Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {jobs.length > 0 ? jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{job.assetName}</p>
                                        <p className="text-[10px] text-white/30 uppercase font-black">S/N: {job.serialNumber || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black px-2.5 py-1 bg-white/[0.05] text-white/60 rounded-lg uppercase border border-white/5">{job.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-white/60 uppercase tracking-tighter">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${job.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                new Date(job.scheduledDate) <= new Date() ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                                }`} />
                                            <span className="text-[10px] font-black text-white/60 uppercase">{job.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/assets/${job.assetId}`} className="inline-flex items-center gap-1.5 text-[9px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-[0.2em] group/btn">
                                            View Asset <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Wrench className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">No maintenance activities tracked</p>
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
