import { useEffect, useMemo, useState } from 'react';
import { cropsAPI } from '../api';
import CropCard from '../components/CropCard';

function MarketplacePage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    grade: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    organicOnly: false
  });

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await cropsAPI.getAllCrops();
        setCrops(response.data);
      } catch (error) {
        console.error('Error fetching crops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const categories = useMemo(() => [...new Set(crops.map((crop) => crop.category).filter(Boolean))], [crops]);

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const matchesSearch = !filters.search ||
        `${crop.name} ${crop.variety} ${crop.farmerName}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchesLocation = !filters.location || crop.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesCategory = !filters.category || crop.category === filters.category;
      const matchesGrade = !filters.grade || crop.qualityGrade === filters.grade;
      const matchesMinPrice = !filters.minPrice || crop.expectedPrice >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || crop.expectedPrice <= Number(filters.maxPrice);
      const matchesQuantity = !filters.minQuantity || crop.quantity >= Number(filters.minQuantity);
      const matchesOrganic = !filters.organicOnly || crop.organic;

      return matchesSearch && matchesLocation && matchesCategory && matchesGrade &&
        matchesMinPrice && matchesMaxPrice && matchesQuantity && matchesOrganic;
    });
  }, [crops, filters]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      grade: '',
      minPrice: '',
      maxPrice: '',
      minQuantity: '',
      organicOnly: false
    });
  };

  return (
    <div className="marketplace-page">
      <section className="page-hero compact">
        <p className="eyebrow">B2B produce marketplace</p>
        <h1>Buy direct from verified farms</h1>
        <p>Compare rates, inspect crop specs, chat with farmers, and start with samples before bulk orders.</p>
      </section>

      <section className="filter-bar">
        <div className="form-group search-wide">
          <label htmlFor="search">Search crops, varieties, farmers</label>
          <input
            id="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Tomato, Premium, Ramesh..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Crop type</label>
          <select id="category" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value="">All types</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="grade">Quality</label>
          <select id="grade" value={filters.grade} onChange={(event) => updateFilter('grade', event.target.value)}>
            <option value="">Any grade</option>
            <option value="Premium">Premium</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            value={filters.location}
            onChange={(event) => updateFilter('location', event.target.value)}
            placeholder="Pune"
          />
        </div>
        <div className="form-group">
          <label htmlFor="minPrice">Min Rs./qtl</label>
          <input id="minPrice" type="number" value={filters.minPrice} onChange={(event) => updateFilter('minPrice', event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="maxPrice">Max Rs./qtl</label>
          <input id="maxPrice" type="number" value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="minQuantity">Min stock</label>
          <input id="minQuantity" type="number" value={filters.minQuantity} onChange={(event) => updateFilter('minQuantity', event.target.value)} />
        </div>
        <label className="toggle-filter">
          <input
            type="checkbox"
            checked={filters.organicOnly}
            onChange={(event) => updateFilter('organicOnly', event.target.checked)}
          />
          Organic only
        </label>
        <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
      </section>

      <div className="results-header">
        <div>
          <p className="eyebrow">Live listings</p>
          <h2>{filteredCrops.length} crop lots available</h2>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="skeleton-card"></div>)}
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="empty-state">
          <h3>No matching crops found</h3>
          <p>Try removing a filter or widening the price and stock range.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredCrops.map((crop) => <CropCard key={crop.id} crop={crop} />)}
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;
