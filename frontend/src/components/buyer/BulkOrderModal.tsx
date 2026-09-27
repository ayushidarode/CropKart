'use client';

import React, { useState } from 'react';
import { CropWithFarmer } from '@/types/crop';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import { createOrder } from '@/lib/api/orders';
import { formatCurrency, formatFarmerIdentity } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface BulkOrderModalProps {
  crop: CropWithFarmer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkOrderModal({ crop, isOpen, onClose, onSuccess }: BulkOrderModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState<number>(1000);
  const [pickupLocation, setPickupLocation] = useState(crop?.location || 'Farm Gate');
  const [deliveryLocation, setDeliveryLocation] = useState(
    user?.location || 'Central Warehouse, APMC Market Yard, Vashi, Navi Mumbai'
  );
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer' | 'cod'>('upi');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!crop) return null;

  const totalPrice = quantity * crop.price_per_unit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setStatus('error');
      setErrorMessage('Please log in as a wholesale buyer to create contracts.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const res = await createOrder({
        order_number: `CK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        buyer_id: user.id,
        farmer_id: crop.farmer_id,
        crop_id: crop.id,
        quantity,
        unit: crop.unit,
        price_per_unit: crop.price_per_unit,
        total_price: totalPrice,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        status: 'pending',
        payment_status: 'escrow',
        payment_method: paymentMethod,
        notes: notes || undefined,
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
        setErrorMessage(res.error || 'Failed to place bulk order');
      }
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected error occurred while placing order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Bulk Trade Purchase Contract"
      description={`Direct contract with ${formatFarmerIdentity(crop.farm_name, crop.farmer_name)}`}
      maxWidth="md"
    >
      {status === 'success' ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Trade Contract Created!</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your bulk order has been submitted and payment escrow initiated. The producer will confirm pickup schedule.
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

          {/* Pricing Calculation Tile */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">{crop.name} ({crop.variety})</p>
              <p className="text-[11px] text-emerald-800 font-semibold">Rate: ₹{crop.price_per_unit}/{crop.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Total</p>
              <p className="text-lg font-black text-emerald-900">{formatCurrency(totalPrice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Order Quantity (${crop.unit})`}
              type="number"
              min="10"
              max={crop.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <Select
              label="Payment Escrow Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
            >
              <option value="upi">UPI Escrow Verification</option>
              <option value="bank_transfer">RTGS / NEFT Commercial</option>
              <option value="cod">Cash on Mandi Delivery</option>
            </Select>
          </div>

          <Input
            label="Farm Gate Pickup Location"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />

          <Input
            label="Destination Warehouse / Delivery Address"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contract Terms or Delivery Instructions
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Schedule arrival on Thursday morning with tare weight slip"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              Confirm Bulk Contract
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
