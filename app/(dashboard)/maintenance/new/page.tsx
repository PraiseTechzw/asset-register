import db from "@/lib/db";
import { Wrench, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewMaintenancePage() {
    const assets = db.prepare("SELECT id, name, serialNumber FROM Asset").all() as any[];

    async function createJob(formData: FormData) {
        "use server";
        const assetId = formData.get("assetId") as string;
        const type = formData.get("type") as string;
        const scheduledDate = formData.get("scheduledDate") as string;
        const notes = formData.get("notes") as string;

        const id = `maint-${Math.random().toString(36).substr(2, 9)}`;

        db.prepare(`
      INSERT INTO MaintenanceJob (id, assetId, type, status, scheduledDate, notes, createdById)
      VALUES (?, ?, ?, 'SCHEDULED', ?, ?, 'user-admin')
    `).run(id, assetId, type, scheduledDate, notes);

        redirect("/maintenance");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/maintenance" className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">New <span className="text-blue-500">Maintenance</span></h1>
                    <p className="text-white/30 text-[10px] font-black tracking-widest uppercase mt-0.5">Asset Service Registration</p>
                </div>
            </div>

            <form action={createJob} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Target Asset</label>
                    <select
                        name="assetId"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/[0.05] transition-all"
                    >
                        <option value="" disabled selected>Select an institutional asset...</option>
                        {assets.map(a => (
                            <option key={a.id} value={a.id} className="bg-[#0a0a0a]">{a.name} ({a.serialNumber || a.id})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Service Type</label>
                        <select
                            name="type"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                        >
                            <option value="ROUTINE">Routine Check</option>
                            <option value="REPAIR">Repair</option>
                            <option value="CRITICAL">Critical Service</option>
                            <option value="UPGRADE">Hardware Upgrade</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Scheduled Date</label>
                        <input
                            type="date"
                            name="scheduledDate"
                            required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Service Notes</label>
                    <textarea
                        name="notes"
                        rows={4}
                        placeholder="Describe the maintenance requirements or identified issues..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none hover:bg-white/[0.05] transition-all"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <Save size={16} /> Register Maintenance Task
                </button>
            </form>

            <div className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] rounded-full border border-white/5">
                    <Wrench size={12} className="text-blue-500" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Automated lifecycle tracking active</span>
                </div>
            </div>
        </div>
    );
}
