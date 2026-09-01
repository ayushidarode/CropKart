import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cropsAPI, dashboardAPI, purchaseRequestsAPI, reviewsAPI } from '../api';
import { useAuth } from '../AuthContext';
import AvailabilityBadge from '../components/AvailabilityBadge';
import CropSathiAssistant from '../components/CropSathiAssistant';

const trackingSteps = ['Confirmed', 'Preparing', 'Picked Up', 'In Transit', 'Delivered'];

function getNextStatus(status) {
  const index = trackingSteps.indexOf(status);
  if (index === -1 || index === trackingSteps.length - 1) return '';
  return trackingSteps[index + 1];
}

function getBadgeClass(status) {
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'success';
}

function FarmerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [crops, setCrops] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    category: 'Vegetable',
    quantity: '',
    unit: 'kg',
    expectedPrice: '',
    harvestDate: '',
    qualityGrade: 'A',
    fertilizersUsed: '',
    organic: 'false',
    moisturePercent: '',
    storageType: '',
    location: user?.location || '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [reviewDrafts, setReviewDrafts] = useState({});

  const fetchDashboardData = async () => {
    try {
      const dashResponse = await dashboardAPI.farmerDashboard();
      setStats(dashResponse.data.stats);
      setCrops(dashResponse.data.crops);
      setPurchaseRequests(dashResponse.data.purchaseRequests);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAddCrop = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.quantity || !formData.expectedPrice) {
      setError('Please fill crop name, quantity, and expected price.');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        latitude: user.location ? 18.5204 : 0,
        longitude: user.location ? 73.8567 : 0
      };
      if (imageFile) submitData.image = imageFile;
      await cropsAPI.addCrop(submitData);

      setSuccess('Crop listing published with full specifications.');
      setFormData({
        name: '',
        variety: '',
        category: 'Vegetable',
        quantity: '',
        unit: 'kg',
        expectedPrice: '',
        harvestDate: '',
        qualityGrade: 'A',
        fertilizersUsed: '',
        organic: 'false',
        moisturePercent: '',
        storageType: '',
        location: user?.location || '',
        description: ''
      });
      setImageFile(null);
      await fetchDashboardData();
      setActiveTab('overview');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish crop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await purchaseRequestsAPI.update(requestId, { status });
      setSuccess(`Request ${status}.`);
      await fetchDashboardData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update request');
    }
  };

  const updateReviewDraft = (requestId, field, value) => {
    setReviewDrafts((current) => ({
      ...current,
      [requestId]: {
        buyerRating: 5,
        comment: '',
        ...(current[requestId] || {}),
        [field]: value
      }
    }));
  };

  const submitFarmerReview = async (requestId) => {
    const draft = reviewDrafts[requestId] || { buyerRating: 5, comment: '' };
    try {
      await reviewsAPI.create({ requestId, ...draft });
      setSuccess('Buyer review submitted.');
      setReviewDrafts((current) => ({ ...current, [requestId]: { submitted: true } }));
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const sampleRequests = purchaseRequests.filter((request) => request.orderType === 'sample');
  const bulkRequests = purchaseRequests.filter((request) => request.orderType === 'bulk');

  const renderRequests = (requests) => {
    if (requests.length === 0) {
      return <div className="empty-state compact"><p>No requests in this queue yet.</p></div>;
    }

    return (
      <div className="grid grid-2">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-head">
              <div>
                <p className="eyebrow">{request.orderType} order</p>
                <h4>{request.cropName}</h4>
                <span>Buyer: {request.buyerName}</span>
              </div>
              <span className={`badge badge-${getBadgeClass(request.status)}`}>
                {request.status}
              </span>
            </div>
            <div className="request-body">
              <p><strong>Quantity:</strong> {request.requestedQuantity} {request.unit || 'kg'}</p>
              <p><strong>Offered price:</strong> Rs.{request.offeredPrice}/quintal</p>
              {request.orderType === 'sample' && (
                <p><strong>Sample satisfied:</strong> {request.sampleApproved ? 'Yes' : 'Not yet'}</p>
              )}
              {request.transportOption && (
                <p><strong>Transport:</strong> {request.transportOption.vehicleType}, Rs.{request.transportOption.estimatedCost}, ETA {request.transportOption.eta}</p>
              )}
              {request.message && <p><strong>Message:</strong> {request.message}</p>}
            </div>
            {request.status === 'pending' && (
              <div className="request-actions">
                <button className="btn btn-primary" onClick={() => handleRequestAction(request.id, 'accepted')}>Accept</button>
                <button className="btn btn-danger" onClick={() => handleRequestAction(request.id, 'rejected')}>Reject</button>
              </div>
            )}
            {getNextStatus(request.status) && (
              <button className="btn btn-primary" onClick={() => handleRequestAction(request.id, getNextStatus(request.status))}>
                Advance to {getNextStatus(request.status)}
              </button>
            )}
            {request.status === 'Delivered' && !reviewDrafts[request.id]?.submitted && (
              <div className="review-form">
                <label>
                  Buyer rating
                  <select value={reviewDrafts[request.id]?.buyerRating || 5} onChange={(event) => updateReviewDraft(request.id, 'buyerRating', Number(event.target.value))}>
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                  </select>
                </label>
                <textarea
                  placeholder="Optional buyer review"
                  value={reviewDrafts[request.id]?.comment || ''}
                  onChange={(event) => updateReviewDraft(request.id, 'comment', event.target.value)}
                />
                <button className="btn btn-secondary" onClick={() => submitFarmerReview(request.id)}>Rate Buyer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="skeleton-card tall"></div>;
  }

  return (
    <div className="dashboard">
      <section className="page-hero compact">
        <p className="eyebrow">Farmer workspace</p>
        <h1>{user.name}</h1>
        <p>Manage live crop lots, respond to sample checks, and convert buyers into bulk orders.</p>
      </section>

      <div className="grid stats-grid">
        <div className="stat-card"><div className="stat-value">{stats?.totalCrops || 0}</div><div className="stat-label">Crops Listed</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.sampleRequests || 0}</div><div className="stat-label">Sample Requests</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.bulkRequests || 0}</div><div className="stat-label">Bulk Requests</div></div>
        <div className="stat-card"><div className="stat-value">{stats?.pendingRequests || 0}</div><div className="stat-label">Pending</div></div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <CropSathiAssistant />

      <div className="tabs">
        <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Listings</button>
        <button className={`tab-button ${activeTab === 'add-crop' ? 'active' : ''}`} onClick={() => setActiveTab('add-crop')}>Add Crop</button>
        <button className={`tab-button ${activeTab === 'samples' ? 'active' : ''}`} onClick={() => setActiveTab('samples')}>Samples ({sampleRequests.length})</button>
        <button className={`tab-button ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>Bulk ({bulkRequests.length})</button>
      </div>

      {activeTab === 'overview' && (
        <section className="tab-content active">
          <div className="section-heading">
            <div>
              <p className="eyebrow">My crop catalog</p>
              <h2>Current listings</h2>
            </div>
            <Link to={`/farmers/${user.id}`} className="btn btn-secondary">View Public Profile</Link>
          </div>
          <div className="grid grid-3">
            {crops.map((crop) => (
              <article key={crop.id} className="listing-mini-card">
                <h4>{crop.name}</h4>
                <p>{crop.variety}</p>
                <AvailabilityBadge crop={crop} />
                <strong>Rs.{crop.expectedPrice}/{crop.priceUnit || 'quintal'}</strong>
                <Link to={`/crop/${crop.id}`} className="btn btn-secondary">Open Listing</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'add-crop' && (
        <section className="tab-content active form-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Full crop specification</p>
              <h2>Publish a New Crop</h2>
            </div>
          </div>
          <form onSubmit={handleAddCrop} className="advanced-form">
            <div className="form-group"><label>Crop Name *</label><input name="name" value={formData.name} onChange={handleFormChange} required /></div>
            <div className="form-group"><label>Variety / Strain</label><input name="variety" value={formData.variety} onChange={handleFormChange} /></div>
            <div className="form-group"><label>Category</label><select name="category" value={formData.category} onChange={handleFormChange}><option>Vegetable</option><option>Fruit</option><option>Grain</option><option>Pulse</option><option>Spice</option><option>Fiber</option><option>Herb</option></select></div>
            <div className="form-group"><label>Quantity *</label><input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required /></div>
            <div className="form-group"><label>Unit</label><select name="unit" value={formData.unit} onChange={handleFormChange}><option value="kg">kg</option><option value="quintal">quintal</option><option value="ton">ton</option></select></div>
            <div className="form-group"><label>Price per quintal *</label><input type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleFormChange} required /></div>
            <div className="form-group"><label>Harvest Date</label><input type="date" name="harvestDate" value={formData.harvestDate} onChange={handleFormChange} /></div>
            <div className="form-group"><label>Quality Grade</label><select name="qualityGrade" value={formData.qualityGrade} onChange={handleFormChange}><option value="Premium">Premium</option><option value="A">A</option><option value="B">B</option></select></div>
            <div className="form-group"><label>Organic</label><select name="organic" value={formData.organic} onChange={handleFormChange}><option value="false">No</option><option value="true">Yes</option></select></div>
            <div className="form-group"><label>Moisture %</label><input type="number" step="0.1" name="moisturePercent" value={formData.moisturePercent} onChange={handleFormChange} /></div>
            <div className="form-group"><label>Storage Type</label><input name="storageType" value={formData.storageType} onChange={handleFormChange} /></div>
            <div className="form-group"><label>Farm Location</label><input name="location" value={formData.location} onChange={handleFormChange} /></div>
            <div className="form-group wide"><label>Fertilizers / pesticides used</label><input name="fertilizersUsed" value={formData.fertilizersUsed} onChange={handleFormChange} placeholder="Compost, Neem cake, Calcium nitrate" /></div>
            <div className="form-group wide"><label>Description</label><textarea name="description" value={formData.description} onChange={handleFormChange}></textarea></div>
            <div className="form-group wide"><label>Crop Image</label><input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files[0])} /></div>
            <button className="btn btn-primary wide" disabled={submitting}>{submitting ? 'Publishing' : 'Publish Listing'}</button>
          </form>
        </section>
      )}

      {activeTab === 'samples' && <section className="tab-content active">{renderRequests(sampleRequests)}</section>}
      {activeTab === 'bulk' && <section className="tab-content active">{renderRequests(bulkRequests)}</section>}
    </div>
  );
}

export default FarmerDashboard;
