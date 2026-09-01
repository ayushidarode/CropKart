import { useEffect, useState } from 'react';
import { dashboardAPI } from '../api';

function MiniBarChart({ title, eyebrow, data = [], format = (value) => value }) {
  const safeData = data.length ? data : [{ label: 'No data', value: 0 }];
  const maxValue = Math.max(...safeData.map((item) => item.value), 1);
  const width = 520;
  const height = 230;
  const barWidth = Math.max(44, Math.min(82, 360 / safeData.length));
  const gap = Math.max(18, (width - 70 - safeData.length * barWidth) / Math.max(1, safeData.length - 1));
  const baseY = 170;

  return (
    <article className="price-chart analytics-chart">
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <line x1="24" y1={baseY} x2="500" y2={baseY} className="chart-axis" />
        {safeData.map((item, index) => {
          const barHeight = item.value ? Math.max(16, (item.value / maxValue) * 135) : 8;
          const x = 34 + index * (barWidth + gap);
          const y = baseY - barHeight;
          return (
            <g key={`${item.label}-${index}`}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="8" className={index % 2 ? 'chart-bar market' : 'chart-bar farmer'} />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="chart-value">{format(item.value)}</text>
              <text x={x + barWidth / 2} y={baseY + 22} textAnchor="middle" className="chart-label">{String(item.label).slice(0, 14)}</text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.adminDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner" style={{ margin: '0 auto' }}></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const charts = stats?.charts || {};

  return (
    <div className="dashboard">
      <section className="page-hero compact">
        <p className="eyebrow">Platform analytics</p>
        <h1>Admin Dashboard</h1>
        <p>Chart-level view of marketplace sales, demand, farmer earnings, and buyer spend.</p>
      </section>

      <div className="grid stats-grid">
        <div className="stat-card"><div className="stat-value">{stats?.farmers || 0}</div><div className="stat-label">Farmers</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.buyers || 0}</div><div className="stat-label">Buyers</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.crops || 0}</div><div className="stat-label">Crops Listed</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.transactions || 0}</div><div className="stat-label">Active Transactions</div></div>
      </div>

      <section className="grid grid-2">
        <MiniBarChart title="Sales Over Time" eyebrow="GMV by day" data={charts.salesOverTime} format={(value) => `Rs.${value}`} />
        <MiniBarChart title="Best-Selling Crops" eyebrow="Volume" data={charts.bestSellingCrops} format={(value) => `${value}kg`} />
        <MiniBarChart title="Farmer Earnings" eyebrow="Supply side" data={charts.farmerEarnings} format={(value) => `Rs.${value}`} />
        <MiniBarChart title="Buyer Spend" eyebrow="Demand side" data={charts.buyerSpend} format={(value) => `Rs.${value}`} />
        <MiniBarChart title="Most-Purchased Crops" eyebrow="Order count" data={charts.mostPurchasedCrops} />
      </section>
    </div>
  );
}

export default AdminDashboard;
