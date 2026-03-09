"use client";

import { useState } from "react";
import { MapPin, Building2, Package, Globe, Layers, Map as MapIcon, Share2, PlusCircle, Check } from "lucide-react";
import Link from "next/link";

interface Campus {
    id: string;
    name: string;
    location: string;
    coordinates: string;
    deptCount: number;
    assetCount: number;
}

export default function MappingClient({ campuses }: { campuses: Campus[] }) {
    const [viewMode, setViewMode] = useState<'satellite' | 'topology'>('topology');
    const [selectedCampus, setSelectedCampus] = useState<string | null>(null);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Geospatial node link copied to clipboard!");
    };

    const handleMapToggle = () => {
        alert(`Switching to ${viewMode === 'topology' ? 'topographic' : 'satellite'} overlay view...`);
        setViewMode(viewMode === 'topology' ? 'satellite' : 'topology');
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
                        <Globe className={`w-8 h-8 text-blue-500 ${selectedCampus ? 'animate-spin-slow' : ''}`} />
                        Geospatial <span className="text-blue-500">Mapping</span>
                    </h1>
                    <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Institutional Asset Topology & Distribution</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl z-20">
                    <button
                        onClick={() => setViewMode('satellite')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'satellite' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-white/30 hover:text-white'}`}
                    >
                        Satellite
                    </button>
                    <button
                        onClick={() => setViewMode('topology')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'topology' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-white/30 hover:text-white'}`}
                    >
                        Topology
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
                {/* Sidebar: Campus List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[700px]">
                    {campuses.map((campus) => (
                        <div
                            key={campus.id}
                            onClick={() => setSelectedCampus(campus.id)}
                            className={`glass-panel p-5 rounded-2xl border transition-all group cursor-pointer relative overflow-hidden ${selectedCampus === campus.id ? 'border-blue-500 bg-blue-500/[0.05]' : 'border-white/5 hover:border-blue-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-xl transition-all ${selectedCampus === campus.id ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-blue-500/10 text-blue-500 order-blue-500/20 group-hover:bg-blue-500 group-hover:text-white'}`}>
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

                    <Link href="/mapping/new" className="w-full py-5 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:border-blue-500/40 hover:text-blue-500 transition-all flex items-center justify-center gap-2 group">
                        <PlusCircle size={14} className="group-hover:scale-110 transition-transform" /> Add Campus
                    </Link>
                </div>

                {/* Main Map Viewport */}
                <div
                    onClick={() => setSelectedCampus(null)}
                    className={`lg:col-span-3 glass-panel rounded-[2.5rem] border border-white/5 relative overflow-hidden transition-all duration-1000 flex flex-col items-center justify-center group ${viewMode === 'satellite' ? 'bg-[#000a1a]' : 'bg-[#050505] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]'}`}
                >

                    {/* Mock Map Background based on Mode */}
                    {viewMode === 'satellite' ? (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#001d3d_0%,_#000a1a_100%)] opacity-60 animate-pulse-slow" />
                    ) : (
                        <div className="absolute inset-0 bg-[url('/map-grid.svg')] bg-center bg-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                    )}

                    {/* Animated Map Grid Lines */}
                    <div className="absolute inset-0 bg-[#050505]/40 opacity-50 pointer-events-none" />

                    {/* Radar effect */}
                    <div className="absolute w-[600px] h-[600px] rounded-full border border-blue-500/10 animate-ping-slow pointer-events-none" />

                    {/* Mock Map Marker Nodes */}
                    {campuses.map((campus, idx) => {
                        const isSelected = selectedCampus === campus.id;
                        return (
                            <div
                                key={campus.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCampus(campus.id);
                                }}
                                className={`absolute transition-all duration-700 z-10 cursor-pointer ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
                                style={{
                                    top: `${25 + idx * 30}%`,
                                    left: `${20 + idx * 40}%`
                                }}
                            >
                                <div className="relative group/node">
                                    <div className={`absolute -inset-6 rounded-full blur-2xl transition-all duration-500 ${isSelected ? 'bg-blue-500/40 animate-pulse' : 'bg-blue-500/20 group-hover/node:bg-blue-500/35'}`} />
                                    <div className={`relative w-10 h-10 bg-[#0a0a0a] border-2 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-blue-400 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.8)]' : 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}>
                                        <MapPin size={18} className={isSelected ? 'animate-bounce text-glow-blue' : ''} />
                                    </div>

                                    {/* Tooltip Labels */}
                                    <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/5 transition-all ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                        <p className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap">{campus.name}</p>
                                    </div>

                                    {/* Info Card on Active */}
                                    {isSelected && (
                                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl transition-all pointer-events-none shadow-[0_30px_60px_rgba(0,0,0,0.8)] opacity-100 translate-y-0 scale-100`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Node</p>
                                                    <p className="text-xs font-black text-white uppercase">{campus.name}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Asset Sync Status</p>
                                                        <p className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><Check size={8} /> {campus.assetCount} Synchronized</p>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600 w-3/4 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.8)]" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="text-lg font-black text-white leading-none">{campus.deptCount}</p>
                                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Departments</p>
                                                    </div>
                                                    <div className="w-[1px] h-8 bg-white/10" />
                                                    <div className="flex-1">
                                                        <p className="text-lg font-black text-white leading-none">98.2%</p>
                                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Audit Score</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* BOTTOM STATUS BAR AND CONTROLS */}
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-20" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">GPS Live Feed Active / {viewMode.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
                                <Layers className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Network Node Connectivity: Stable</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCampus(null);
                                    setViewMode('topology');
                                }}
                                className="px-6 py-3 bg-[#0a0a0a]/80 hover:bg-white/5 text-[9px] font-black text-white/40 hover:text-white rounded-2xl border border-white/5 transition-all uppercase tracking-widest active:scale-[0.98]"
                            >
                                Reset View
                            </button>
                            <button
                                onClick={handleMapToggle}
                                className="p-3.5 bg-[#0a0a0a]/80 hover:bg-white/5 text-white/40 hover:text-white rounded-2xl border border-white/5 transition-all flex items-center justify-center group active:scale-[0.98]"
                                title="Map Layers"
                            >
                                <MapIcon size={20} className="group-hover:text-blue-500 transition-colors" />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-3.5 bg-[#0a0a0a]/80 hover:bg-white/5 text-white/40 hover:text-white rounded-2xl border border-white/5 transition-all flex items-center justify-center group active:scale-[0.98]"
                                title="Share Node"
                            >
                                <Share2 size={20} className="group-hover:text-blue-500 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {!selectedCampus && (
                        <div className="flex flex-col items-center gap-6 z-0 animate-pulse pointer-events-none">
                            <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-full">
                                <Package className="w-20 h-20 text-white/5" />
                            </div>
                            <p className="text-xs font-black text-white/10 uppercase tracking-[0.8em]">Select node for deep analysis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
