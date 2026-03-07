"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Package, TrendingDown, ArrowUpRight, AlertOctagon } from 'lucide-react';
import StatCard from '@/components/StatCard';

const depreciationData = [
    { year: '2022', value: 1200000 },
    { year: '2023', value: 1050000 },
    { year: '2024', value: 920000 },
    { year: '2025', value: 810000 },
    { year: '2026', value: 680000 },
];

const replacementForecast = [
    { module: 'Laptops', cost: 120000 },
    { module: 'Projectors', cost: 45000 },
    { module: 'Servers', cost: 250000 },
    { module: 'Furniture', cost: 30000 },
];

const conditionData = [
    { name: 'Optimal', value: 65, fill: '#10b981' },
    { name: 'Degrading', value: 25, fill: '#f59e0b' },
    { name: 'Critical', value: 10, fill: '#f43f5e' },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Financial Insight & Forecasting</h2>
                    <p className="text-gray-500 mt-1">Depreciation analytics and replacement forecasting.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in stagger-1">
                <StatCard
                    title="Current Total Value"
                    value="$810,000"
                    icon={Package}
                    trend={{ value: '12%', isPositive: false }}
                />
                <StatCard
                    title="YTD Depreciation"
                    value="$110,000"
                    icon={TrendingDown}
                    trend={{ value: '4%', isPositive: false }}
                />
                <StatCard
                    title="Est. Replacement Cost"
                    value="$445,000"
                    icon={ArrowUpRight}
                    trend={{ value: 'System Needs', isPositive: false }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in stagger-2">
                {/* Depreciation Curve */}
                <div className="glass-card rounded-2xl p-6 h-[400px] flex flex-col">
                    <h3 className="font-semibold text-lg text-[var(--foreground)] mb-6">Asset Depreciation Curve</h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={depreciationData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="year" stroke="var(--border)" tick={{ fill: '#9ca3af' }} />
                                <YAxis stroke="var(--border)" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `$${value / 1000}k`} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'var(--accent)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Replacement Forecast */}
                <div className="glass-card rounded-2xl p-6 h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg text-[var(--foreground)]">Replacement Cost Forecast (Next 12 Months)</h3>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" /> Action Required
                        </span>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={replacementForecast} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                <XAxis type="number" stroke="var(--border)" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `$${value / 1000}k`} />
                                <YAxis dataKey="module" type="category" stroke="var(--border)" tick={{ fill: '#9ca3af' }} width={80} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'var(--accent)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                                    cursor={{ fill: 'var(--border)' }}
                                />
                                <Bar dataKey="cost" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
