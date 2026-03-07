import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, delay = 0 }) => {
    return (
        <div
            className="glass-card p-6 rounded-2xl animate-fade-in flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="absolute -right-6 -top-6 text-[var(--accent)] opacity-50 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <Icon size={120} />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-[var(--accent)] rounded-xl border border-[var(--border)]">
                    <Icon className="w-6 h-6 text-blue-500" />
                </div>
            </div>

            <div className="relative z-10 mt-2">
                <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
                <div className="flex items-baseline gap-3">
                    <h3 className="text-3xl font-bold font-mono tracking-tight text-[var(--foreground)]">{value}</h3>
                    {trend && (
                        <span className={`text-sm font-medium flex items-center ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {trend.isPositive ? '+' : '-'}{trend.value}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
