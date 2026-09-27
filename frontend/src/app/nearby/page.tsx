'use client';

import React, { useState, useEffect } from 'react';
import { getCrops } from '@/lib/api/crops';
import { CropWithFarmer } from '@/types/crop';
import { CropCard } from '@/components/marketplace/CropCard';
import { SampleRequestModal } from '@/components/marketplace/SampleRequestModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { calculateDistanceKm } from '@/lib/utils';
import { MapPin, Navigation, Compass, AlertCircle, Sparkles } from 'lucide-react';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Ludhiana: { lat: 30.901, lng: 75.8573 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
};

const RADIUS_OPTIONS = [25, 50, 100, 200];

export default function NearbyPage() {
  const [crops, setCrops] = useState<CropWithFarmer[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Pune');
  const [radiusKm, setRadiusKm] = useState<number>(100);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(
    CITY_COORDINATES.Pune
  );
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCropForSample, setSelectedCropForSample] = useState<CropWithFarmer | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await getCrops();
        setCrops(res.crops);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsStatus('granted');
        setSelectedCity('GPS Location');
      },
      () => {
        setGpsStatus('denied');
      },
      { timeout: 8000 }
    );
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setUserCoords(CITY_COORDINATES[city]);
    setGpsStatus('idle');
  };

  // Filter crops based on distance from selected center
  const nearbyCropsWithDistance = crops.map((crop) => {
    // Lookup crop coordinates or approximate by district
    let cropCoords = CITY_COORDINATES.Pune;
    const loc = crop.location.toLowerCase();
    if (loc.includes('nashik')) cropCoords = CITY_COORDINATES.Nashik;
    else if (loc.includes('mumbai')) cropCoords = CITY_COORDINATES.Mumbai;
    else if (loc.includes('ludhiana') || loc.includes('punjab')) cropCoords = CITY_COORDINATES.Ludhiana;
    else if (loc.includes('indore')) cropCoords = CITY_COORDINATES.Indore;

    const distance = userCoords
      ? calculateDistanceKm(userCoords.lat, userCoords.lng, cropCoords.lat, cropCoords.lng)
      : 0;

    return { crop, distance };
  });

  const filteredNearby = nearbyCropsWithDistance.filter((item) => item.distance <= radiusKm);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Compass className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge variant="emerald" size="sm">
              Geographic Proximity Engine
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Find Harvest Produce Nearby
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover local farm lots within your delivery radius to minimize transit cost and carbon footprint.
          </p>
        </div>

        <Button
          variant={gpsStatus === 'granted' ? 'secondary' : 'outline'}
          size="sm"
          onClick={requestGpsLocation}
          isLoading={gpsStatus === 'locating'}
          leftIcon={<Navigation className="w-4 h-4 text-emerald-700" />}
        >
          {gpsStatus === 'granted' ? 'Using Live GPS' : 'Use Current Device Location'}
        </Button>
      </div>

      {gpsStatus === 'denied' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700" />
          <span>
            Location access was denied or timed out. You can select your regional mandi hub from the city quick picks below.
          </span>
        </div>
      )}

      {/* Control Panel: City Quick Picks & Radius */}
      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Mandi Center Hub Quick Picks
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CITY_COORDINATES).map((city) => (
              <button
                key={city}
                onClick={() => handleSelectCity(city)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCity === city
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/10'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search Radius:
            </span>
            <div className="flex items-center gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    radiusKm === r
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Found <strong className="text-slate-900">{filteredNearby.length}</strong> farm batches within{' '}
            <strong className="text-emerald-700">{radiusKm} km</strong> of {selectedCity}
          </p>
        </div>
      </Card>

      {/* Main Results Grid */}
      {isLoading ? (
        <LoadingState message="Calculating geographic distances..." />
      ) : filteredNearby.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">
            No crops listed within {radiusKm} km of {selectedCity}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try expanding your search radius to 200 km or select another nearby mandi hub.
          </p>
          <Button size="sm" variant="outline" onClick={() => setRadiusKm(200)}>
            Expand to 200 km
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNearby.map(({ crop, distance }) => (
            <div key={crop.id} className="relative">
              <div className="absolute top-2 right-2 z-20 bg-slate-950/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono">
                ~{distance} km away
              </div>
              <CropCard
                crop={crop}
                onRequestSample={(c) => setSelectedCropForSample(c)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sample Request Modal */}
      <SampleRequestModal
        crop={selectedCropForSample}
        isOpen={Boolean(selectedCropForSample)}
        onClose={() => setSelectedCropForSample(null)}
      />
    </div>
  );
}
