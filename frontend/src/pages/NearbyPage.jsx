import { useState, useEffect } from 'react';
import { cropsAPI } from '../api';
import CropCard from '../components/CropCard';

function NearbyPage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(10);
  const [nearbyMode, setNearbyMode] = useState('demo'); // 'demo' or 'gps'

  // Demo coordinates for different locations
  const demoLocations = {
    pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
    mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
    bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
    delhi: { lat: 28.7041, lng: 77.1025, name: 'Delhi' }
  };

  const handleLocationSelect = async (location) => {
    setLoading(true);
    setError('');
    try {
      const response = await cropsAPI.getNearby(
        location.lat,
        location.lng,
        radius
      );

      // Calculate distance for each crop
      const cropsWithDistance = response.data.map(crop => {
        const distance = getDistance(
          location.lat,
          location.lng,
          crop.coordinates.lat,
          crop.coordinates.lng
        );
        return { ...crop, distance };
      });

      setCrops(cropsWithDistance.sort((a, b) => a.distance - b.distance));
      setUserLocation(location);
    } catch (err) {
      setError('Failed to load nearby crops');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude, name: 'Your Location' };

        try {
          const response = await cropsAPI.getNearby(latitude, longitude, radius);

          // Calculate distance for each crop
          const cropsWithDistance = response.data.map(crop => {
            const distance = getDistance(
              latitude,
              longitude,
              crop.coordinates.lat,
              crop.coordinates.lng
            );
            return { ...crop, distance };
          });

          setCrops(cropsWithDistance.sort((a, b) => a.distance - b.distance));
          setUserLocation(location);
          setNearbyMode('gps');
        } catch (err) {
          setError('Failed to load nearby crops');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      }
    );
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // Load demo location by default
    handleLocationSelect(demoLocations.pune);
  }, []);

  return (
    <>
      <h1 style={{ marginBottom: '2rem' }}>📍 Crops Available Near You</h1>

      <div className="card card-body" style={{ marginBottom: '2rem', backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
        <h3 style={{ marginBottom: '1rem' }}>Select Your Location</h3>
        <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
          Choose a location to see crops available nearby. This demo uses sample locations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {Object.entries(demoLocations).map(([key, location]) => (
            <button
              key={key}
              className="btn"
              onClick={() => handleLocationSelect(location)}
              style={{
                backgroundColor: userLocation?.name === location.name ? '#10b981' : '#e5e7eb',
                color: userLocation?.name === location.name ? 'white' : '#1f2937'
              }}
            >
              📍 {location.name}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGPSLocation}
          style={{ marginBottom: '1rem' }}
        >
          📍 Use My GPS Location
        </button>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, maxWidth: '200px' }}>
            <label htmlFor="radius">Search Radius (km)</label>
            <input
              id="radius"
              type="number"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => userLocation && handleLocationSelect(userLocation)}
          >
            Refresh Results
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {userLocation && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          📍 <strong>Location:</strong> {userLocation.name} | <strong>Radius:</strong> {radius} km | <strong>Results:</strong> {crops.length} crops found
        </div>
      )}

      {loading ? (
        <div className="text-center mt-4">
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p>Loading nearby crops...</p>
        </div>
      ) : crops.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>🌾 No crops found</h3>
          <p style={{ marginTop: '1rem' }}>Try increasing the search radius or selecting a different location</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {crops.map(crop => (
            <div key={crop.id}>
              <CropCard crop={crop} showDistance={true} distance={crop.distance} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default NearbyPage;
