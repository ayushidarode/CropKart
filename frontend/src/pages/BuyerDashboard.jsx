import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, purchaseRequestsAPI, reviewsAPI } from '../api';
import { useAuth } from '../AuthContext';
import CropSathiAssistant from '../components/CropSathiAssistant';

const trackingSteps = ['Confirmed', 'Preparing', 'Picked Up', 'In Transit', 'Delivered'];

function getBadgeClass(status) {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'success';
}

function StatusTimeline({ status }) {
  const activeIndex = trackingSteps.indexOf(status);
  if (activeIndex === -1) return null;
  return (
    <div className="status-stepper">
      {trackingSteps.map((step, index) => (
        <div key={step} className={`status-step ${index <= activeIndex ? 'active' : ''}`}>
          <span>{index + 1}</span>
          <strong>{step}</strong>
        </div>
      ))}
    </div>
  );
}

function BuyerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState(null);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transportOptions, setTransportOptions] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.buyerDashboard();
      setStats(response.data.stats);
      setPurchaseRequests(response.data.purchaseRequests);
    } catch (err) {
      setError('Failed to load buyer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const markSampleSatisfied = async (requestId) => {
    try {
      await purchaseRequestsAPI.update(requestId, { sampleApproved: true });
      setSuccess('Sample marked satisfied. Bulk order is unlocked on the crop page.');
      await fetchDashboardData();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to mark sample satisfied.');
    }
  };

  const loadTransportOptions = async (requestId) => {
    try {
      const response = await purchaseRequestsAPI.getTransportOptions(requestId);
      setTransportOptions((current) => ({ ...current, [requestId]: response.data }));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load transport options.');
    }
  };

  const chooseTransport = async (requestId, optionId) => {
    try {
      await purchaseRequestsAPI.update(requestId, { transportOptionId: optionId });
      setSuccess('Bulk order confirmed with transport.');
      await fetchDashboardData();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to confirm transport.');
    }
  };

  const updateReviewDraft = (requestId, field, value) => {
    setReviewDrafts((current) => ({
      ...current,
      [requestId]: {
        farmerRating: 5,
        cropRating: 5,
        comment: '',
        ...(current[requestId] || {}),
        [field]: value
      }
    }));
  };

  const submitBuyerReview = async (requestId) => {
    const draft = reviewDrafts[requestId] || { farmerRating: 5, cropRating: 5, comment: '' };
    try {
      await reviewsAPI.create({ requestId, ...draft });
      setSuccess('Review submitted.');
      setReviewDrafts((current) => ({ ...current, [requestId]: { submitted: true } }));
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit review.');
    }
  };

  const filteredRequests = purchaseRequests.filter((request) => {
    if (activeTab === 'samples') return request.orderType === 'sample';
    if (activeTab === 'bulk') return request.orderType === 'bulk';
    return true;
  });

  if (loading) {
    return <div className="skeleton-card tall"></div>;
  }

  return (
    <div className="dashboard">
      <section className="page-hero compact">
        <p className="eyebrow">Buyer workspace</p>
        <h1>{user.name}</h1>
        <p>Track sample checks, compare accepted lots, and move into bulk procurement.</p>
      </section>

      <div className="grid stats-grid">
        <div className="stat-card"><div className="stat-value">{stats?.totalRequests || 0}</div><div className="stat-label">Total Requests</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.pendingRequests || 0}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.acceptedRequests || 0}</div><div className="stat-label">Accepted</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.samplesSatisfied || 0}</div><div className="stat-label">Samples Satisfied</div></div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <CropSathiAssistant />

      <div className="tabs">
        <button className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
        <button className={`tab-button ${activeTab === 'samples' ? 'active' : ''}`} onClick={() => setActiveTab('samples')}>Samples</button>
        <button className={`tab-button ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>Bulk</button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <h3>No requests yet</h3>
          <p>Start from the marketplace and open a crop listing to request a sample or bulk order.</p>
          <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {filteredRequests.map((request) => (
            <article key={request.id} className="request-card">
              <div className="request-head">
                <div>
                  <p className="eyebrow">{request.orderType} order</p>
                  <h4>{request.cropName}</h4>
                  <span>Farmer: {request.farmerName}</span>
                </div>
                <span className={`badge badge-${getBadgeClass(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div className="request-body">
                <p><strong>Quantity:</strong> {request.requestedQuantity} {request.unit || 'kg'}</p>
                <p><strong>Offered price:</strong> Rs.{request.offeredPrice}/quintal</p>
                <p><strong>Order type:</strong> {request.orderType}</p>
                <p><strong>Sample approved:</strong> {request.sampleApproved ? 'Yes' : 'No'}</p>
                <p><strong>Sent:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                {request.transportOption && (
                  <p><strong>Transport:</strong> {request.transportOption.vehicleType}, Rs.{request.transportOption.estimatedCost}, ETA {request.transportOption.eta}</p>
                )}
                {request.message && <p><strong>Message:</strong> {request.message}</p>}
              </div>

              <StatusTimeline status={request.status} />

              {request.orderType === 'sample' && request.status === 'accepted' && !request.sampleApproved && (
                <button className="btn btn-primary" onClick={() => markSampleSatisfied(request.id)}>
                  Mark Sample Satisfied
                </button>
              )}
              {request.sampleApproved && (
                <Link to={`/crop/${request.cropId}`} className="btn btn-primary">Proceed to Bulk Order</Link>
              )}

              {request.orderType === 'bulk' && request.status === 'accepted' && (
                <div className="transport-panel">
                  <button className="btn btn-secondary" onClick={() => loadTransportOptions(request.id)}>
                    Show Transport Options
                  </button>
                  {transportOptions[request.id]?.map((option) => (
                    <button key={option.id} className="transport-option" onClick={() => chooseTransport(request.id, option.id)}>
                      <strong>{option.vehicleType}</strong>
                      <span>{option.capacity} / {option.distanceKm} km</span>
                      <span>Rs.{option.estimatedCost} / ETA {option.eta}</span>
                    </button>
                  ))}
                </div>
              )}

              {request.status === 'Delivered' && !reviewDrafts[request.id]?.submitted && (
                <div className="review-form">
                  <div className="order-grid">
                    <label>
                      Farmer rating
                      <select value={reviewDrafts[request.id]?.farmerRating || 5} onChange={(event) => updateReviewDraft(request.id, 'farmerRating', Number(event.target.value))}>
                        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                      </select>
                    </label>
                    <label>
                      Crop rating
                      <select value={reviewDrafts[request.id]?.cropRating || 5} onChange={(event) => updateReviewDraft(request.id, 'cropRating', Number(event.target.value))}>
                        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                      </select>
                    </label>
                  </div>
                  <textarea
                    placeholder="Optional review comment"
                    value={reviewDrafts[request.id]?.comment || ''}
                    onChange={(event) => updateReviewDraft(request.id, 'comment', event.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => submitBuyerReview(request.id)}>Submit Review</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
