import React from 'react';
import { Package, MapPin, Clock } from 'lucide-react';

interface AssetCardProps {
    id: string;
    name: string;
    category: string;
    department: string;
    condition: 'Optimal' | 'Degrading' | 'Critical';
    lastAudit: string;
}

const tagColors = {
    Optimal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Degrading: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const AssetCard: React.FC<AssetCardProps> = ({ id, name, category, department, condition, lastAudit }) => {
    return (
        <div className="glass-panel p-5 rounded-xl hover:bg-[var(--accent)] transition-all cursor-pointer border-l-4" style={{
            borderLeftColor: condition === 'Optimal' ? '#34d399' : condition === 'Degrading' ? '#fbbf24' : '#fb7185'
        }}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                        <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--foreground)]">{name}</h4>
                        <span className="text-xs text-gray-500 font-mono">{id}</span>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${tagColors[condition]}`}>
                    {condition}
                </span>
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
