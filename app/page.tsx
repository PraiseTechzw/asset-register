"use client";

import StatCard from '@/components/StatCard';
import CampusOverview from '@/components/CampusOverview';
import MissingAssetsPanel from '@/components/MissingAssetsPanel';
import { Package, Laptop, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Asset Intelligence</h2>
          <p className="text-gray-500 mt-1">Real-time valuation and condition overview for Zimbabwe Open University.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[var(--accent)] hover:bg-[#262626] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors cursor-pointer text-[var(--foreground)]">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors cursor-pointer">
            + Quick Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assets Value"
          value="$1.2M"
          icon={Package}
          trend={{ value: '2.4%', isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Active Devices"
          value="4,521"
          icon={Laptop}
          trend={{ value: '1.2%', isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Pending Audits"
          value="342"
          icon={AlertTriangle}
          trend={{ value: '18%', isPositive: false }}
          delay={0.3}
        />
        <StatCard
          title="Verified Condition"
          value="89%"
          icon={CheckCircle}
          trend={{ value: '4.1%', isPositive: true }}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in stagger-3 h-[450px]">
        <div className="lg:col-span-2">
          <CampusOverview />
        </div>
        <div className="lg:col-span-1">
          <MissingAssetsPanel />
        </div>
      </div>
    </div>
  );
}
