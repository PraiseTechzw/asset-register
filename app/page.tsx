import StatCard from '@/components/StatCard';
import CampusOverview from '@/components/CampusOverview';
import MissingAssetsPanel from '@/components/MissingAssetsPanel';
import { Package, Laptop, AlertTriangle, CheckCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  // 1. Fetch Key Metrics
  const valuations = await prisma.valuation.findMany();
  const totalValue = valuations.reduce((acc, v) => acc + v.currentBookValue, 0);

  const activeCount = await prisma.asset.count({ where: { status: 'ACTIVE' } });

  const pendingAudits = await prisma.asset.count({
    where: { OR: [{ status: 'MISSING' }, { condition: 'POOR' }] }
  });

  const totalCount = await prisma.asset.count();
  const verifiedCount = await prisma.asset.count({
    where: { condition: { in: ['EXCELLENT', 'GOOD'] } }
  });
  const verifiedPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // 2. Format Value
  const formattedTotalValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: "compact",
    maximumFractionDigits: 1
  }).format(totalValue);

  // 3. Fetch Department Stats
  const dbDepartments = await prisma.department.findMany({
    include: { assets: true }
  });

  const deptStats = dbDepartments.map(d => {
    const total = d.assets.length;
    const issues = d.assets.filter(a => a.status === 'MISSING' || a.condition === 'POOR' || a.condition === 'SCRAP').length;
    return {
      name: d.name,
      assets: total,
      issueRate: total > 0 ? Math.round((issues / total) * 100) : 0
    };
  });

  // 4. Fetch Missing Assets
  const missingDbAssets = await prisma.asset.findMany({
    where: { status: 'MISSING' },
    include: { currentDepartment: true },
    take: 5,
    orderBy: { updatedAt: 'desc' }
  });

  const missingAssets = missingDbAssets.map(a => {
    const updatedDate = new Date(a.updatedAt);
    const diffDays = Math.floor((new Date().getTime() - updatedDate.getTime()) / (1000 * 3600 * 24));
    let lastSeenText = diffDays === 0 ? 'Today' : `${diffDays} days ago`;

    return {
      id: a.id,
      name: a.name,
      dept: a.currentDepartment?.name || 'Unknown',
      lastSeen: lastSeenText
    };
  });

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in stagger-3 h-[450px]">
        <div className="lg:col-span-2">
          <CampusOverview stats={deptStats} />
        </div>
        <div className="lg:col-span-1">
          <MissingAssetsPanel assets={missingAssets} />
        </div>
      </div>
    </div>
  );
}
