import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function HomePage() {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'farmer'
    ? '/farmer/dashboard'
    : user?.role === 'buyer'
      ? '/buyer/dashboard'
      : '/admin/dashboard';

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div>
            <p className="hero-kicker">Fresh B2B produce marketplace</p>
            <h1>CropKart</h1>
            <p className="hero-copy">
              Source verified farm produce directly from farmers with live stock,
              sample checks, negotiated bulk orders, and transparent market rates.
            </p>
            <div className="hero-actions">
              <Link to="/marketplace" className="btn btn-primary">Explore Marketplace</Link>
              <Link to="/nearby" className="btn btn-secondary hero-secondary">Find Crops Nearby</Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-header">
              <span>Today on CropKart</span>
              <strong>Wholesale ready</strong>
            </div>
            <div className="deal-row">
              <span>Premium Grapes</span>
              <strong>Rs.5400/qtl</strong>
            </div>
            <div className="deal-row">
              <span>Organic Soybean</span>
              <strong>900kg live</strong>
            </div>
            <div className="deal-row">
              <span>Tomato Sample</span>
              <strong>25kg crate</strong>
            </div>
            <Link to={user ? dashboardPath : '/register'} className="btn btn-primary">
              {user ? 'Open Dashboard' : 'Start Trading'}
            </Link>
          </div>
        </div>
      </section>

      <section className="metrics-band">
        <div>
          <strong>12</strong>
          <span>live crop lots</span>
        </div>
        <div>
          <strong>2</strong>
          <span>verified farms</span>
        </div>
        <div>
          <strong>4.8</strong>
          <span>avg farmer rating</span>
        </div>
        <div>
          <strong>5 sec</strong>
          <span>chat refresh</span>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading centered">
          <p className="eyebrow">Built for produce teams</p>
          <h2>Fast discovery, cleaner negotiation, better buying decisions</h2>
        </div>

        <div className="grid grid-3">
          <div className="feature-card">
            <span className="feature-icon">F</span>
            <h3>Farmer catalog</h3>
            <p>Each profile shows multiple crop varieties, quality grade, harvest date, stock, storage, and farm location.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">M</span>
            <h3>Market comparison</h3>
            <p>Visual price comparison shows farmer rate against three reference markets before buyers negotiate.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">S</span>
            <h3>Sample to bulk</h3>
            <p>Buyers can request a small sample first, mark it satisfied, then unlock a prefilled bulk order path.</p>
          </div>
        </div>
      </section>

      <section className="content-section split-section">
        <div>
          <p className="eyebrow">Marketplace flow</p>
          <h2>From crop search to farmer chat in a few taps</h2>
          <p>
            CropKart now behaves more like a commerce product: sticky filters,
            product badges, clear availability, farmer storefronts, and order
            actions that separate quality checks from bulk procurement.
          </p>
        </div>
        <div className="process-list">
          <div><strong>1</strong><span>Filter by crop, location, grade, price, and stock.</span></div>
          <div><strong>2</strong><span>Open specs, gallery, rate chart, and farmer profile.</span></div>
          <div><strong>3</strong><span>Negotiate, request sample, then place a bulk order.</span></div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
