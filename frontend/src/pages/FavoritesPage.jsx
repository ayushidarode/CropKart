import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../api';
import CropCard from '../components/CropCard';

function FavoritesPage() {
  const [favorites, setFavorites] = useState({ crops: [], farmers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      setFavorites(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) return <div className="skeleton-card tall"></div>;

  return (
    <div className="dashboard">
      <section className="page-hero compact">
        <p className="eyebrow">Saved shortlist</p>
        <h1>My Favorites</h1>
        <p>Saved crops and farmers for quick repeat buying decisions.</p>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Saved crops</p>
            <h2>{favorites.crops.length} crop lots</h2>
          </div>
        </div>
        {favorites.crops.length === 0 ? (
          <div className="empty-state compact"><p>No crops saved yet.</p></div>
        ) : (
          <div className="grid grid-3">
            {favorites.crops.map((crop) => <CropCard key={crop.id} crop={crop} />)}
          </div>
        )}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Saved farmers</p>
            <h2>{favorites.farmers.length} farms</h2>
          </div>
        </div>
        {favorites.farmers.length === 0 ? (
          <div className="empty-state compact"><p>No farmers saved yet.</p></div>
        ) : (
          <div className="grid grid-3">
            {favorites.farmers.map((farmer) => (
              <article key={farmer.id} className="listing-mini-card">
                <h4>{farmer.farmName || farmer.name}</h4>
                <p>{farmer.location}</p>
                <strong>{farmer.averageRating || 0} average rating</strong>
                <Link to={`/farmers/${farmer.id}`} className="btn btn-secondary">Open Profile</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FavoritesPage;
