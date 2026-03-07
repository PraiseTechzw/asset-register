import StatCard from '@/components/StatCard';
import CampusOverview from '@/components/CampusOverview';
import MissingAssetsPanel from '@/components/MissingAssetsPanel';
import { Package, Laptop, AlertTriangle, CheckCircle } from 'lucide-react';
import db from '@/lib/db';
import Link from 'next/link';

export default async function Home() {
  // 1. Fetch Key Metrics
  const valuations = db.prepare('SELECT currentBookValue FROM Valuation').all() as { currentBookValue: number }[];
  const totalValue = valuations.reduce((acc, v) => acc + v.currentBookValue, 0);

  const activeCount = (db.prepare("SELECT COUNT(*) as count FROM Asset WHERE status = 'ACTIVE'").get() as any).count;

  const pendingAudits = (db.prepare("SELECT COUNT(*) as count FROM Asset WHERE status = 'MISSING' OR condition = 'POOR'").get() as any).count;

  const totalCount = (db.prepare("SELECT COUNT(*) as count FROM Asset").get() as any).count;

  const verifiedCount = (db.prepare("SELECT COUNT(*) as count FROM Asset WHERE condition IN ('EXCELLENT', 'GOOD')").get() as any).count;

  const verifiedPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // 2. Format Value
  const formattedTotalValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: "compact",
    maximumFractionDigits: 1
  }).format(totalValue);

  // 3. Fetch Department Stats
  const departments = db.prepare('SELECT * FROM Department').all() as any[];

  const deptStats = departments.map(d => {
    const assets = db.prepare('SELECT status, condition FROM Asset WHERE currentDepartmentId = ?').all(d.id) as any[];
    const total = assets.length;
    const issues = assets.filter(a => a.status === 'MISSING' || a.condition === 'POOR' || a.condition === 'SCRAP').length;
    return {
      name: d.name,
      assets: total,
      issueRate: total > 0 ? Math.round((issues / total) * 100) : 0
    };
  });

  // 4. Fetch Missing Assets
  const missingDbAssets = db.prepare(`
    SELECT a.*, d.name as deptName 
    FROM Asset a 
    LEFT JOIN Department d ON a.currentDepartmentId = d.id 
    WHERE a.status = 'MISSING' 
    ORDER BY a.updatedAt DESC 
    LIMIT 5
  `).all() as any[];

  const missingAssets = missingDbAssets.map(a => {
    const updatedDate = new Date(a.updatedAt);
    const diffDays = Math.floor((new Date().getTime() - updatedDate.getTime()) / (1000 * 3600 * 24));
    let lastSeenText = diffDays === 0 ? 'Today' : `${diffDays} days ago`;

    return {
      id: a.id,
      name: a.name,
      dept: a.deptName || 'Unknown',
      lastSeen: lastSeenText
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 animate-fade-in">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">Asset Intelligence</h2>
          <p className="text-gray-500 mt-1 text-sm">Real-time valuation and condition overview for Zimbabwe Open University.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <a
            href="/api/reports/export"
            className="flex-1 sm:flex-none px-4 py-2 bg-[var(--accent)] hover:bg-[#262626] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors cursor-pointer text-[var(--foreground)] flex items-center justify-center"
          >
            Export Report
          </a>
          <Link href="/scanner" className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors cursor-pointer flex items-center justify-center">
            + Quick Audit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assets Value"
          value={formattedTotalValue}
          icon={Package}
          trend={{ value: '2.4%', isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Active Devices"
          value={activeCount.toLocaleString()}
          icon={Laptop}
          trend={{ value: '1.2%', isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Pending Audits"
          value={pendingAudits.toString()}
          icon={AlertTriangle}
          trend={{ value: '18%', isPositive: false }}
          delay={0.3}
        />
        <StatCard
          title="Verified Condition"
          value={`${verifiedPercent}%`}
          icon={CheckCircle}
          trend={{ value: '4.1%', isPositive: true }}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in stagger-3">
        <div className="lg:col-span-2 min-h-[300px] lg:h-[450px]">
          <CampusOverview stats={deptStats} />
        </div>
        <div className="lg:col-span-1 min-h-[250px] lg:h-[450px]">
          <MissingAssetsPanel assets={missingAssets} />
        </div>
      </div>
    </div>
  );
}
