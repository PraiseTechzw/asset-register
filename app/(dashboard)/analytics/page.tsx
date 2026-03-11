import db from '@/lib/db';
import { Package, TrendingDown, ArrowUpRight, AlertOctagon } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { DepreciationArea, ReplacementBar } from '@/components/AnalyticsCharts';

export default async function AnalyticsPage() {
    // 1. Current Total Value (Sum of Current Book Values)
    const metricsResult = await db.execute(`
        SELECT 
            SUM(v.currentBookValue) as totalValue,
            SUM(v.accumulatedDepreciation) as totalDepreciation,
            COUNT(*) as assetCount
        FROM Valuation v
    `);
    const metrics = metricsResult.rows[0] as any;

    // 2. Replacement Forecast (Assets with condition POOR or life ending soon)
    const replacementListResult = await db.execute(`
        SELECT category, SUM(purchasePrice) as cost
        FROM Asset
        WHERE condition IN ('POOR', 'SCRAP', 'FAIR') OR status = 'MISSING'
        GROUP BY category
    `);
    const replacementList = replacementListResult.rows as any[];

    // 3. Depreciation Curve (Simulated based on real data for next 5 years)
    const currentVal = metrics.totalValue || 0;
    const depreciationData = [
        { year: '2024', value: currentVal },
        { year: '2025', value: currentVal * 0.85 },
        { year: '2026', value: currentVal * 0.70 },
        { year: '2027', value: currentVal * 0.55 },
        { year: '2028', value: currentVal * 0.40 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6 animate-fade-in">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Financial Insight & Forecasting</h2>
                    <p className="text-gray-500 mt-1">Real-time depreciation analytics and replacement forecasting based on current inventory.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in stagger-1">
                <StatCard
                    title="Current Net Book Value"
                    value={`$${Math.round(metrics.totalValue || 0).toLocaleString()}`}
                    icon={Package}
                    trend={{ value: `${metrics.assetCount || 0} Assets`, isPositive: true }}
                />
                <StatCard
                    title="Total Accumulated Depr."
                    value={`$${Math.round(metrics.totalDepreciation || 0).toLocaleString()}`}
                    icon={TrendingDown}
                    trend={{ value: 'System Lifetime', isPositive: false }}
                />
                <StatCard
                    title="Est. Replacement Cost"
                    value={`$${Math.round(replacementList.reduce((acc, curr) => acc + curr.cost, 0)).toLocaleString()}`}
                    icon={ArrowUpRight}
                    trend={{ value: 'Critical/Scrap', isPositive: false }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in stagger-2">
                <div className="glass-card rounded-2xl p-6 h-[400px] flex flex-col border border-[var(--border)] bg-[var(--background)]">
                    <h3 className="font-semibold text-lg text-[var(--foreground)] mb-6">Aggregate Depreciation Projection</h3>
                    <div className="flex-1 w-full relative">
                        <DepreciationArea data={depreciationData} />
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 h-[400px] flex flex-col border border-[var(--border)] bg-[var(--background)]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg text-[var(--foreground)]">Replacement Forecast by Module</h3>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" /> Critical Needs
                        </span>
                    </div>
                    <div className="flex-1 w-full">
                        <ReplacementBar data={replacementList} />
                    </div>
                </div>
            </div>
        </div>
    );
}
