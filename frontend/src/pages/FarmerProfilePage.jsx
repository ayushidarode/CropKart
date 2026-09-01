import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cropsAPI, favoritesAPI } from '../api';
import { useAuth } from '../AuthContext';
import CropCard from '../components/CropCard';
import NegotiationChat from '../components/NegotiationChat';

function FarmerProfilePage() {
  const { farmerId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeCropId, setActiveCropId] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await cropsAPI.getFarmerProfile(farmerId);
        setProfile(response.data);
        setActiveCropId(response.data.crops[0]?.id || '');
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load farmer profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="detail-shell">
        <div className="skeleton-card tall"></div>
        <div className="skeleton-card tall"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="alert alert-error">{error}</div>;
  }

  const { farmer, stats, crops } = profile;
  const activeCrop = crops.find((crop) => crop.id === activeCropId) || crops[0];

  const toggleSaveFarmer = async () => {
    try {
      const response = await favoritesAPI.toggle({ type: 'farmer', targetId: farmer.id });
      setSaved(response.data.saved);
    } catch (err) {
      setSaved(false);
    }
  };

  return (
    <div className="farmer-profile-page">
      <section className="farmer-hero">
        <div>
          <p className="eyebrow">Public farmer profile</p>
          <h1>{farmer.farmName || farmer.name}</h1>
          <p>{farmer.name} supplies verified produce from {farmer.location} with active crop lots ready for sample and bulk buying.</p>
          {user?.role === 'buyer' && (
            <button className="btn btn-secondary mt-2" onClick={toggleSaveFarmer}>
              {saved ? 'Saved Farmer' : 'Save Farmer'}
            </button>
          )}
        </div>
        <div className="farmer-stats">
          <div><strong>{stats.averageRating}</strong><span>Average rating</span></div>
          <div><strong>{farmer.yearsActive}</strong><span>Years active</span></div>
          <div><strong>{stats.totalCropsSold}</strong><span>Crops sold</span></div>
          <div><strong>{stats.currentListings}</strong><span>Current listings</span></div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent reviews</p>
            <h2>Buyer and order feedback</h2>
          </div>
        </div>
        {profile.reviews?.length ? (
          <div className="grid grid-3">
            {profile.reviews.map((review) => (
              <article className="listing-mini-card" key={review.id}>
                <h4>{review.cropName}</h4>
                <p>{review.comment || 'No comment provided.'}</p>
                <strong>
                  {review.reviewerRole === 'buyer'
                    ? `${review.farmerRating}/5 farmer, ${review.cropRating}/5 crop`
                    : `${review.buyerRating}/5 buyer`}
                </strong>
                <span className="text-muted">By {review.reviewerName}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact"><p>No reviews submitted yet.</p></div>
        )}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Crop catalog</p>
            <h2>{crops.length} active varieties from this farm</h2>
          </div>
        </div>
        <div className="grid grid-3">
          {crops.map((crop) => <CropCard key={crop.id} crop={crop} />)}
        </div>
      </section>

      {activeCrop && (
        <section className="content-section detail-grid">
          <div className="profile-crop-selector">
            <p className="eyebrow">Start negotiation</p>
            <h3>Select a crop listing</h3>
            <div className="selector-list">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  className={crop.id === activeCrop.id ? 'active' : ''}
                  onClick={() => setActiveCropId(crop.id)}
                >
                  <strong>{crop.name}</strong>
                  <span>{crop.variety} - Rs.{crop.expectedPrice}/{crop.priceUnit}</span>
                </button>
              ))}
            </div>
          </div>
          <NegotiationChat crop={activeCrop} compact />
        </section>
      )}
    </div>
  );
}

export default FarmerProfilePage;
