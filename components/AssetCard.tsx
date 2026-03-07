import React from 'react';
import { Package, MapPin, Clock } from 'lucide-react';

interface AssetCardProps {
    id: string;
    name: string;
    category: string;
    department: string;
    condition: string;
    lastAudit: string;
    status?: string;
}

const conditionColors: Record<string, string> = {
    EXCELLENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    GOOD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    FAIR: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    POOR: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    SCRAP: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Optimal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', // Fallback for old data
};

const AssetCard: React.FC<AssetCardProps> = ({ id, name, category, department, condition, lastAudit, status }) => {
    const colorClass = conditionColors[condition] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

    return (
        <div className="glass-panel p-5 rounded-xl hover:bg-[var(--accent)] transition-all cursor-pointer border border-[var(--border)] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] group-hover:border-blue-500/50 transition-colors">
                        <Package className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--foreground)] truncate max-w-[150px]">{name}</h4>
                        <span className="text-xs text-gray-500 font-mono">{id}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${colorClass}`}>
                        {condition}
                    </span>
                    {status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                            {status}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="truncate">{lastAudit}</span>
                </div>
            </div>
        </div>
    );
};

export default AssetCard;
