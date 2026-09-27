'use client';

import React, { useState } from 'react';
import { CropWithFarmer } from '@/types/crop';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { createSampleRequest } from '@/lib/api/samples';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { formatFarmerIdentity } from '@/lib/utils';

export interface SampleRequestModalProps {
  crop: CropWithFarmer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SampleRequestModal({
  crop,
  isOpen,
  onClose,
  onSuccess,
}: SampleRequestModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(2);
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.location || 'Central Warehouse, APMC Yard, Vashi, Navi Mumbai 400703'
  );
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!crop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setStatus('error');
      setErrorMessage('Please log in as a buyer to request samples.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const res = await createSampleRequest({
        crop_id: crop.id,
        buyer_id: user.id,
        farmer_id: crop.farmer_id,
        quantity,
        unit: 'kg',
        delivery_address: deliveryAddress,
        notes: notes || undefined,
        status: 'sample_requested',
      });

      if (res.success) {
        setStatus('success');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 1800);
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Failed to submit request');
      }
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Verification Sample"
      description={`Submit a direct sample request to ${formatFarmerIdentity(crop.farm_name, crop.farmer_name)}`}
      maxWidth="md"
    >
      {status === 'success' ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Sample Request Dispatched!</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The farmer has been notified. You can track courier dispatch and status in your Buyer Dashboard.
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

          {/* Selected Crop Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">{crop.name}</p>
              <p className="text-[11px] text-slate-500">{crop.variety} · {crop.quality_grade}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-emerald-800">
                ₹{crop.price_per_unit}/{crop.unit}
              </p>
              <p className="text-[10px] text-slate-400">{crop.location}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sample Quantity (kg)
            </label>
            <Input
              type="number"
              min="0.5"
              max="25"
              step="0.5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Standard laboratory testing size is 1 to 5 kg.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Delivery Address & PIN
            </label>
            <textarea
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              placeholder="Provide company warehouse or quality testing lab address..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Special Testing Notes (Optional)
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Moisture test certificate or grain elongation evaluation"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Send Request to Farmer
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
