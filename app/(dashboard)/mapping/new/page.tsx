import db from "@/lib/db";
import { Building2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewCampusPage() {
    async function createCampus(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const location = formData.get("location") as string;
        const coordinates = formData.get("coordinates") as string;

        const id = `campus-${Math.random().toString(36).substr(2, 5)}`;

        db.prepare(`
      INSERT INTO Campus (id, name, location, coordinates)
      VALUES (?, ?, ?, ?)
    `).run(id, name, location, coordinates);

        redirect("/mapping");
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/mapping" className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Add <span className="text-blue-500">Campus</span></h1>
                    <p className="text-white/30 text-[10px] font-black tracking-widest uppercase mt-0.5">Geospatial Node Registration</p>
                </div>
            </div>

            <form action={createCampus} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Campus Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Harare Main Campus"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Geographic Location</label>
                    <input
                        type="text"
                        name="location"
                        required
                        placeholder="e.g. Mount Pleasant, Harare"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">GPS Coordinates (lat,lng)</label>
                    <input
                        type="text"
                        name="coordinates"
                        placeholder="-17.783,31.050"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <Save size={16} /> Register Campus Node
                </button>
            </form>
        </div>
    );
}
