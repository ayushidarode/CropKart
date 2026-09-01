function PriceComparisonChart({ comparison }) {
  if (!comparison) return null;

  const values = [
    ...comparison.marketPrices.map((item) => ({ label: item.market, price: item.price, type: 'market' })),
    { label: 'Farmer Rate', price: comparison.farmerPrice, type: 'farmer' }
  ];
  const maxPrice = Math.max(...values.map((item) => item.price)) * 1.15;
  const chartWidth = 520;
  const chartHeight = 240;
  const barWidth = 74;
  const gap = 36;
  const startX = 34;
  const baseY = 178;

  return (
    <div className="price-chart">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Market intelligence</p>
          <h3>Farmer Rate vs Market</h3>
        </div>
        <span className={`price-position ${comparison.position}`}>
          {comparison.position === 'at'
            ? 'At market average'
            : `${Math.abs(comparison.deltaPercent)}% ${comparison.position} average`}
        </span>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Farmer price compared with three market prices">
        <line x1="24" y1={baseY} x2="500" y2={baseY} className="chart-axis" />
        {values.map((item, index) => {
          const height = Math.max(16, (item.price / maxPrice) * 150);
          const x = startX + index * (barWidth + gap);
          const y = baseY - height;
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx="8"
                className={item.type === 'farmer' ? 'chart-bar farmer' : 'chart-bar market'}
              />
              <text x={x + barWidth / 2} y={y - 10} textAnchor="middle" className="chart-value">
                Rs.{item.price}
              </text>
              <text x={x + barWidth / 2} y={baseY + 22} textAnchor="middle" className="chart-label">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="chart-summary">
        <strong>Average market:</strong> Rs.{comparison.averageMarketPrice}/{comparison.priceUnit}.
        Farmer listed rate is Rs.{comparison.farmerPrice}/{comparison.priceUnit}.
      </div>
    </div>
  );
}

export default PriceComparisonChart;
