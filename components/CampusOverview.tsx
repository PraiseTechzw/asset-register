"use client";
import React, { useState, useMemo } from 'react';

export interface DeptStat {
    name: string;
    assets: number;
    issueRate: number;
}

interface CampusOverviewProps {
    stats?: DeptStat[];
}

const uiDepartments = [
    { id: 'cs', name: 'Computer Science', x: 20, y: 30, width: 120, height: 80 },
    { id: 'eng', name: 'Engineering', x: 160, y: 20, width: 140, height: 100 },
    { id: 'admin', name: 'Administration', x: 50, y: 130, width: 100, height: 90 },
    { id: 'lib', name: 'Library', x: 170, y: 140, width: 110, height: 80 },
    { id: 'media', name: 'Media Studies', x: 300, y: 60, width: 90, height: 140 },
];

const CampusOverview: React.FC<CampusOverviewProps> = ({ stats = [] }) => {
    const [hoveredDept, setHoveredDept] = useState<string | null>(null);

    const departments = useMemo(() => {
        return uiDepartments.map(uiDept => {
            const stat = stats.find(s => s.name === uiDept.name);
            return {
                ...uiDept,
                assets: stat?.assets ?? 0,
                issueRate: stat?.issueRate ?? 0
            };
        });
    }, [stats]);

    const getStatusColor = (issueRate: number) => {
        if (issueRate > 10) return 'rgba(244, 63, 94, 0.4)'; // Rose
        if (issueRate > 4) return 'rgba(245, 158, 11, 0.4)'; // Amber
        return 'rgba(16, 185, 129, 0.4)'; // Emerald
    };

    const getStatusBorder = (issueRate: number) => {
        if (issueRate > 10) return '#f43f5e';
        if (issueRate > 4) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div className="glass-card rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-[var(--foreground)]">Campus Grid Heatmap</h3>
                <div className="flex gap-4 text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Optimal</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Pending Audits</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Critical Issues</span>
                </div>
            </div>

            <div className="flex-1 relative bg-[var(--background)] rounded-xl border border-[var(--border)] overflow-hidden">
                {/* Abstract Grid background */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>

                {/* Zones */}
                <div className="absolute inset-0 p-8">
                    <div className="relative w-full h-full">
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
                                className="absolute transition-all duration-300 cursor-pointer flex items-center justify-center p-2 rounded-lg backdrop-blur-sm"
                                style={{
                                    left: `${dept.x}px`,
                                    top: `${dept.y}px`,
                                    width: `${dept.width}px`,
                                    height: `${dept.height}px`,
                                    backgroundColor: hoveredDept === dept.id ? getStatusColor(dept.issueRate).replace('0.4', '0.6') : getStatusColor(dept.issueRate),
                                    border: `1px solid ${getStatusBorder(dept.issueRate)}`,
                                    boxShadow: hoveredDept === dept.id ? `0 0 20px ${getStatusBorder(dept.issueRate)}40` : 'none',
                                    zIndex: hoveredDept === dept.id ? 10 : 1,
                                    transform: hoveredDept === dept.id ? 'scale(1.05)' : 'scale(1)'
                                }}
                                onMouseEnter={() => setHoveredDept(dept.id)}
                                onMouseLeave={() => setHoveredDept(null)}
                            >
                                <div className="bg-[var(--accent)] text-xs font-semibold px-2 py-1 rounded shadow text-[var(--foreground)] max-w-full text-center truncate">
                                    {dept.name}
                                </div>

                                {/* Tooltip */}
                                {hoveredDept === dept.id && (
                                    <div className="absolute top-full mt-2 w-48 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl p-4 z-50 animate-fade-in pointer-events-none text-left">
                                        <h4 className="font-bold text-[var(--foreground)] mb-2 truncate">{dept.name}</h4>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Total Assets:</span>
                                                <span className="font-mono text-[var(--foreground)]">{dept.assets}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Issues:</span>
                                                <span className={`font-mono ${dept.issueRate > 10 ? 'text-rose-400' : dept.issueRate > 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {dept.issueRate}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampusOverview;
