import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cropsAPI, marketPricesAPI, purchaseRequestsAPI } from '../api';
import { useAuth } from '../AuthContext';
import AvailabilityBadge from '../components/AvailabilityBadge';
import NegotiationChat from '../components/NegotiationChat';
import PriceComparisonChart from '../components/PriceComparisonChart';

function CropDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crop, setCrop] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [activePhoto, setActivePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSpecTab, setActiveSpecTab] = useState('specs');
  const [bulkQuantity, setBulkQuantity] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [sampleMessage, setSampleMessage] = useState('Please send a quality-check sample before bulk confirmation.');
  const [bulkMessage, setBulkMessage] = useState('Ready for bulk order after final rate confirmation.');
  const [submitting, setSubmitting] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadBuyerRequests = async () => {
    if (user?.role !== 'buyer') return;
    const response = await purchaseRequestsAPI.getAll();
    setBuyerRequests(response.data.filter((request) => request.cropId === id));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cropResponse = await cropsAPI.getCropById(id);
        setCrop(cropResponse.data);
        setActivePhoto(cropResponse.data.photos?.[0] || cropResponse.data.image);
        setBulkPrice(cropResponse.data.expectedPrice);
        setBulkQuantity(Math.min(100, cropResponse.data.quantity || 100));

        const comparisonResponse = await marketPricesAPI.compare(id);
        setComparison(comparisonResponse.data);
        await loadBuyerRequests();
      } catch (err) {
        setError(err.response?.data?.error || 'Crop not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id]);

  const acceptedSample = useMemo(() => (
    buyerRequests.find((request) => request.orderType === 'sample' && request.status === 'accepted')
  ), [buyerRequests]);

  const satisfiedSample = useMemo(() => (
    buyerRequests.find((request) => request.orderType === 'sample' && request.sampleApproved)
  ), [buyerRequests]);

  const requireBuyer = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    if (user.role !== 'buyer') {
      setError('Only buyers can place sample or bulk orders.');
      return false;
    }
    return true;
  };

  const createOrder = async (orderType) => {
    if (!requireBuyer()) return;

    setSubmitting(orderType);
    setError('');
    setSuccess('');
    try {
      await purchaseRequestsAPI.create({
        cropId: crop.id,
        quantity: orderType === 'sample' ? 10 : Number(bulkQuantity),
        offeredPrice: orderType === 'sample' ? crop.expectedPrice : Number(bulkPrice),
        orderType,
        message: orderType === 'sample' ? sampleMessage : bulkMessage
      });
      setSuccess(orderType === 'sample'
        ? 'Sample request sent. The farmer can accept or reject it from the dashboard.'
        : 'Bulk order request sent to the farmer.');
      await loadBuyerRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to place request');
    } finally {
      setSubmitting('');
    }
  };

  const markSampleSatisfied = async () => {
    if (!acceptedSample) return;
    setSubmitting('sampleApproved');
    setError('');
    try {
      await purchaseRequestsAPI.update(acceptedSample.id, { sampleApproved: true });
      setSuccess('Sample marked satisfied. Bulk order is now ready to proceed.');
      await loadBuyerRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update sample status');
    } finally {
      setSubmitting('');
    }
  };

  if (loading) {
    return (
      <div className="detail-shell">
        <div className="skeleton-card tall"></div>
        <div className="skeleton-card tall"></div>
      </div>
    );
  }

  if (!crop) {
    return <div className="alert alert-error">{error || 'Crop not found'}</div>;
  }

  const photos = crop.photos?.length ? crop.photos : [crop.image];

  return (
    <div className="crop-detail-page">
      <button className="btn btn-secondary" onClick={() => navigate('/marketplace')}>Back to Marketplace</button>

      {error && <div className="alert alert-error mt-2">{error}</div>}
      {success && <div className="alert alert-success mt-2">{success}</div>}

      <section className="detail-shell mt-3">
        <div className="gallery-panel">
          <div className="product-image-main">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={crop.name}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <div className="image-fallback large">{crop.name.slice(0, 1)}</div>
          </div>
          <div className="thumb-row">
            {photos.map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                className={photo === activePhoto ? 'active' : ''}
                onClick={() => setActivePhoto(photo)}
              >
                Lot {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="product-summary">
          <div className="product-title">
            <div>
              <p className="eyebrow">{crop.category} / {crop.variety}</p>
              <h1>{crop.name}</h1>
            </div>
            <AvailabilityBadge crop={crop} />
          </div>

          <div className="product-price">Rs.{crop.expectedPrice}<span>/{crop.priceUnit || 'quintal'}</span></div>
          <p className="product-description">{crop.description}</p>

          <div className="quick-spec-grid">
            <div><span>Grade</span><strong>{crop.qualityGrade}</strong></div>
            <div><span>Harvest</span><strong>{new Date(crop.harvestDate).toLocaleDateString()}</strong></div>
            <div><span>Moisture</span><strong>{crop.moisturePercent}%</strong></div>
            <div><span>Storage</span><strong>{crop.storageType}</strong></div>
          </div>

          <Link to={`/farmers/${crop.farmerId}`} className="farmer-profile-strip">
            <div>
              <span>Seller</span>
              <strong>{crop.farmName || crop.farmerName}</strong>
              <small>{crop.farmLocation || crop.location}</small>
            </div>
            <span>View public profile</span>
          </Link>
        </div>
      </section>

      <section className="detail-grid mt-4">
        <div className="spec-panel">
          <div className="tabs">
            <button className={`tab-button ${activeSpecTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveSpecTab('specs')}>
              Crop Info / Specifications
            </button>
            <button className={`tab-button ${activeSpecTab === 'quality' ? 'active' : ''}`} onClick={() => setActiveSpecTab('quality')}>
              Quality & Handling
            </button>
          </div>

          {activeSpecTab === 'specs' && (
            <div className="spec-list">
              <div><span>Current available quantity</span><strong>{crop.quantity} {crop.unit}</strong></div>
              <div><span>Harvest date</span><strong>{new Date(crop.harvestDate).toLocaleDateString()}</strong></div>
              <div><span>Grade / quality</span><strong>{crop.qualityGrade}</strong></div>
              <div><span>Organic status</span><strong>{crop.organic ? 'Organic lot' : 'Conventional lot'}</strong></div>
              <div className="wide">
                <span>Fertilizers / pesticides used</span>
                <strong>{crop.fertilizersUsed?.length ? crop.fertilizersUsed.join(', ') : 'Not specified'}</strong>
              </div>
            </div>
          )}

          {activeSpecTab === 'quality' && (
            <div className="spec-list">
              <div><span>Storage type</span><strong>{crop.storageType}</strong></div>
              <div><span>Moisture</span><strong>{crop.moisturePercent}%</strong></div>
              <div><span>Farm location</span><strong>{crop.farmLocation || crop.location}</strong></div>
              <div><span>Coordinates</span><strong>{crop.coordinates.lat}, {crop.coordinates.lng}</strong></div>
            </div>
          )}
        </div>

        <PriceComparisonChart comparison={comparison} />
      </section>

      <section className="detail-grid mt-4">
        <NegotiationChat crop={crop} />

        <div className="order-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Procurement actions</p>
              <h3>Sample and Bulk Orders</h3>
            </div>
          </div>

          <div className="order-card sample">
            <div>
              <h4>Order Sample</h4>
              <p>Fixed 10kg quality-check request before committing to volume.</p>
            </div>
            <textarea value={sampleMessage} onChange={(event) => setSampleMessage(event.target.value)} />
            <button className="btn btn-secondary" disabled={submitting === 'sample'} onClick={() => createOrder('sample')}>
              {submitting === 'sample' ? 'Sending Sample' : 'Order Sample'}
            </button>

            {acceptedSample && !satisfiedSample && (
              <button className="btn btn-primary" disabled={submitting === 'sampleApproved'} onClick={markSampleSatisfied}>
                Mark Sample Satisfied
              </button>
            )}
          </div>

          <div className="order-card bulk">
            <div>
              <h4>Place Bulk Order</h4>
              <p>{satisfiedSample ? 'Sample approved. Bulk form is ready.' : 'You can place a direct bulk request or complete sample approval first.'}</p>
            </div>
            <div className="order-grid">
              <label>
                Quantity ({crop.unit})
                <input type="number" min="1" max={crop.quantity} value={bulkQuantity} onChange={(event) => setBulkQuantity(event.target.value)} />
              </label>
              <label>
                Price (Rs./{crop.priceUnit || 'quintal'})
                <input type="number" value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value)} />
              </label>
            </div>
            <textarea value={bulkMessage} onChange={(event) => setBulkMessage(event.target.value)} />
            <button className="btn btn-primary" disabled={submitting === 'bulk'} onClick={() => createOrder('bulk')}>
              {submitting === 'bulk' ? 'Placing Bulk Order' : satisfiedSample ? 'Proceed to Bulk Order' : 'Place Bulk Order'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CropDetailPage;
