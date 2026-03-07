"use client";
import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export interface MissingAsset {
    id: string;
    name: string;
    dept: string;
    lastSeen: string;
}

interface MissingAssetsPanelProps {
    assets?: MissingAsset[];
}

const MissingAssetsPanel: React.FC<MissingAssetsPanelProps> = ({ assets = [] }) => {
    return (
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg text-[var(--foreground)]">Missing Assets</h3>
                </div>
                <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-full border border-rose-500/20">
                    {assets.length} Critical
                </span>
            </div>

            <div className="flex-1 space-y-3">
                {assets.map((asset, i) => (
                    <div key={asset.id} className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] group hover:border-rose-500/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm text-[var(--foreground)] group-hover:text-rose-400 transition-colors">{asset.name}</h4>
                            <span className="text-xs text-gray-500 font-mono">{asset.id}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>{asset.dept}</span>
                            <span className="flex items-center gap-1">
                                Last seen: {asset.lastSeen}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-4 w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20">
                Initiate Search Protocol
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default MissingAssetsPanel;
