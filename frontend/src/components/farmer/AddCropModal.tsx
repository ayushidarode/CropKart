'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import { createCrop } from '@/lib/api/crops';
import { CROP_CATEGORIES, QUALITY_GRADES, UNITS } from '@/lib/constants';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { CropCategory, QualityGrade } from '@/types/database';

export interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCropModal({ isOpen, onClose, onSuccess }: AddCropModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<CropCategory>('Grain');
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number>(25);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A');
  const [organic, setOrganic] = useState(false);
  const [location, setLocation] = useState(user?.location || 'Pune, Maharashtra');
  const [description, setDescription] = useState('');
  const [moisturePercent, setMoisturePercent] = useState<number>(11.0);
  const [storageType, setStorageType] = useState('Silo Dry Storage');
  const [fertilizersUsed, setFertilizersUsed] = useState('Organic Compost');
  const [imageUrl, setImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setStatus('error');
      setErrorMessage('User session not found.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const res = await createCrop({
        farmer_id: user.id,
        name,
        variety,
        category,
        quantity,
        unit,
        price_per_unit: pricePerUnit,
        quality_grade: qualityGrade,
        organic,
        location,
        district: location.split(',')[0]?.trim() || location,
        state: location.split(',')[1]?.trim() || 'Maharashtra',
        description,
        moisture_percent: moisturePercent,
        storage_type: storageType,
        fertilizers_used: fertilizersUsed,
        primary_image_url: imageUrl || undefined,
        status: 'available',
      });

      if (res.success) {
        setStatus('success');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Failed to list crop');
      }
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected error occurred during crop listing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="List New Crop for B2B Trade"
      description="Add verified agricultural harvest produce directly to the CropKart marketplace."
      maxWidth="lg"
    >
      {status === 'success' ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Crop Listed Successfully!</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your listing is live on the marketplace. Verified wholesale buyers can now discover your produce and submit sample requests.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Crop Name"
              placeholder="e.g. Sharbati Wheat, Red Onion"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Variety"
              placeholder="e.g. Sharbati Gold, Garwa Red"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CropCategory)}
            >
              {CROP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Select
              label="Quality Grade"
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
            >
              {QUALITY_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={organic}
                  onChange={(e) => setOrganic(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Certified Organic</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Total Available Quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <Select
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
            <Input
              label={`Price per ${unit} (₹)`}
              type="number"
              min="0.5"
              step="0.5"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Farm Gate / Dispatch Location"
              placeholder="e.g. Baramati, Pune, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Input
              label="Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Moisture Content (%)"
              type="number"
              step="0.1"
              value={moisturePercent}
              onChange={(e) => setMoisturePercent(Number(e.target.value))}
            />
            <Input
              label="Storage Condition"
              placeholder="e.g. Dry Warehouse, Crates"
              value={storageType}
              onChange={(e) => setStorageType(e.target.value)}
            />
            <Input
              label="Fertilizers Applied"
              placeholder="e.g. Neem Cake, Vermicompost"
              value={fertilizersUsed}
              onChange={(e) => setFertilizersUsed(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Crop Quality Description & Testing Specifications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe grading parameters, harvest freshness, and packaging details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Publish Crop Listing
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
