import db from "@/lib/db";
import { MapPin, Building2, Package, ArrowUpRight, Globe, Layers, Map as MapIcon, Share2 } from "lucide-react";
import Link from "next/link";

export default async function MappingPage() {
    const campuses = db.prepare(`
    SELECT c.*, 
    (SELECT COUNT(*) FROM Department d WHERE d.campusId = c.id) as deptCount,
    (SELECT COUNT(*) FROM Asset a JOIN Department d ON a.currentDepartmentId = d.id WHERE d.campusId = c.id) as assetCount
    FROM Campus c
  `).all() as any[];

    return (
        <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
                        <Globe className="w-8 h-8 text-blue-500 animate-spin-slow" />
                        Geospatial <span className="text-blue-500">Mapping</span>
                    </h1>
                    <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Institutional Asset Topology & Distribution</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Satellite</button>
                    <button className="px-4 py-2 text-white/40 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Topology</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                {/* Sidebar: Campus List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {campuses.map((campus) => (
                        <div key={campus.id} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Building2 size={18} />
                                </div>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{campus.id}</span>
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-blue-400 transition-colors">{campus.name}</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter mb-4 flex items-center gap-1">
                                <MapPin size={10} className="text-blue-500" /> {campus.location}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div className="p-2 bg-white/[0.02] rounded-xl border border-white/[0.03]">
                                    <p className="text-[14px] font-black text-white">{campus.deptCount}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Depts</p>
                                </div>
                                <div className="p-2 bg-white/[0.02] rounded-xl border border-white/[0.03]">
                                    <p className="text-[14px] font-black text-white">{campus.assetCount}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Assets</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:border-blue-500/40 hover:text-blue-500 transition-all">
                        + Add Campus
                    </button>
                </div>

                {/* Main Map Viewport (Visual Placeholder/Dashboard) */}
                <div className="lg:col-span-3 glass-panel rounded-3xl border border-white/5 relative overflow-hidden bg-[url('/map-grid.svg')] bg-center bg-cover flex flex-col items-center justify-center group min-h-[500px]">
                    {/* Animated Map Grid Lines */}
                    <div className="absolute inset-0 bg-[#050505]/40 opacity-50 pointer-events-none" />

                    {/* Radar effect */}
                    <div className="absolute w-[600px] h-[600px] rounded-full border border-blue-500/10 animate-ping-slow pointer-events-none" />
                    <div className="absolute w-[400px] h-[400px] rounded-full border border-blue-500/5 animate-ping-slower pointer-events-none" />

                    {/* Mock Map Marker Nodes */}
                    {campuses.map((campus, idx) => (
                        <div
                            key={campus.id}
                            className="absolute transition-all hover:scale-110 z-10"
                            style={{
                                top: `${30 + idx * 20}%`,
                                left: `${30 + idx * 25}%`
                            }}
                        >
                            <div className="relative group/node">
                                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl group-hover/node:bg-blue-500/40 transition-all animate-pulse" />
                                <div className="relative w-8 h-8 bg-[#0a0a0a] border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                    <MapPin size={14} className="animate-bounce" />
                                </div>
                                {/* Info Card on Hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl opacity-0 group-hover/node:opacity-100 transition-all pointer-events-none shadow-2xl">
                                    <p className="text-xs font-black text-white uppercase mb-1">{campus.name}</p>
                                    <p className="text-[10px] text-blue-400 font-black mb-2">{campus.assetCount} ACTIVE ASSETS</p>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-3/4 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full border border-white/5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-[9px] font-black text-white/60 tracking-widest uppercase">GPS Live Feed Active</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full border border-white/5">
                                <Layers className="w-3 h-3 text-blue-500" />
                                <span className="text-[9px] font-black text-white/60 tracking-widest uppercase">ZOU Network Nodes: OK</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="p-3 bg-[#0a0a0a]/80 hover:bg-white/5 text-white/40 hover:text-white rounded-2xl border border-white/5 transition-all">
                                <MapIcon size={18} />
                            </button>
                            <button className="p-3 bg-[#0a0a0a]/80 hover:bg-white/5 text-white/40 hover:text-white rounded-2xl border border-white/5 transition-all">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 z-0">
                        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-full">
                            <Package className="w-16 h-16 text-white/5" />
                        </div>
                        <p className="text-xs font-black text-white/10 uppercase tracking-[0.6em]">System Topology View</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
