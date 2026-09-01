import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { favoritesAPI } from '../api';
import AvailabilityBadge from './AvailabilityBadge';

function CropCard({ crop, showDistance = false, distance = null }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const photo = crop.image || crop.photos?.[0] || '/default-crop.jpg';

  const toggleSave = async () => {
    try {
      const response = await favoritesAPI.toggle({ type: 'crop', targetId: crop.id });
      setSaved(response.data.saved);
    } catch (error) {
      setSaved(false);
    }
  };

  return (
    <article className="crop-card ecommerce-card">
      <Link to={`/crop/${crop.id}`} className="crop-image-wrap">
        <img
          src={photo}
          alt={`${crop.name} ${crop.variety || ''}`}
          className="crop-image"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div className="image-fallback">{crop.name?.slice(0, 1) || 'C'}</div>
        <div className="card-badges">
          {crop.organic && <span className="badge badge-organic">Organic</span>}
          {crop.qualityGrade === 'Premium' && <span className="badge badge-premium">Premium</span>}
          <span className="badge badge-muted">New Harvest</span>
        </div>
      </Link>

      <div className="crop-info">
        <div className="crop-title-row">
          <div>
            <p className="eyebrow">{crop.category || 'Produce'}</p>
            <h3 className="crop-name">{crop.name}</h3>
            <p className="crop-variety">{crop.variety || 'Standard variety'}</p>
          </div>
          <span className="quality-chip">{crop.qualityGrade || 'A'}</span>
        </div>

        <div className="crop-details">
          <AvailabilityBadge crop={crop} />
          <span>{crop.location}</span>
          {showDistance && (distance || crop.distance) && (
            <span>{Number(distance || crop.distance).toFixed(1)} km away</span>
          )}
        </div>

        <div className="crop-price">Rs.{crop.expectedPrice}<span>/{crop.priceUnit || 'quintal'}</span></div>

        {crop.farmerName && (
          <Link to={`/farmers/${crop.farmerId}`} className="farmer-link">
            {crop.farmName || crop.farmerName}
          </Link>
        )}

        <div className="crop-actions">
          <Link to={`/crop/${crop.id}`} className="btn btn-primary">View Deal</Link>
          <Link to={`/farmers/${crop.farmerId}`} className="btn btn-secondary">Farmer</Link>
          {user?.role === 'buyer' && (
            <button type="button" className="btn btn-secondary" onClick={toggleSave}>
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default CropCard;
