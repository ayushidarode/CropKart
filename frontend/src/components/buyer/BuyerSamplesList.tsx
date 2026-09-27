'use client';

import React, { useState } from 'react';
import { SampleRequestWithDetails } from '@/types/sample';
import { updateSampleStatus } from '@/lib/api/samples';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatFarmerIdentity } from '@/lib/utils';
import { Package, Truck, CheckCircle, ThumbsUp, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export function BuyerSamplesList({
  samples,
  onRefresh,
  onOrderClick,
}: {
  samples: SampleRequestWithDetails[];
  onRefresh: () => void;
  onOrderClick?: (sample: SampleRequestWithDetails) => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleApprove = async (sampleId: string) => {
    setUpdatingId(sampleId);
    await updateSampleStatus(sampleId, 'approved');
    setUpdatingId(null);
    onRefresh();
  };

  if (samples.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-8 h-8" />}
        title="No Sample Inquiries Yet"
        description="Explore verified agricultural listings and request free/nominal laboratory testing samples before bulk buying."
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sample_requested':
        return <Badge variant="amber">WAITING FOR FARMER</Badge>;
      case 'sample_accepted':
        return <Badge variant="blue">PREPARING DISPATCH</Badge>;
      case 'sample_sent':
        return <Badge variant="emerald">IN TRANSIT / COURIERED</Badge>;
      case 'approved':
        return <Badge variant="emerald">SAMPLE VERIFIED & APPROVED</Badge>;
      case 'rejected':
      case 'sample_rejected':
        return <Badge variant="rose">REJECTED BY FARMER</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900">
        Your Verification Sample Requests ({samples.length})
      </h4>

      <div className="space-y-3">
        {samples.map((s) => (
          <div
            key={s.id}
            className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {s.crop?.name || 'Crop Produce'} ({s.quantity} {s.unit})
                </span>
                {getStatusBadge(s.status)}
              </div>

              <p className="text-xs text-slate-600">
                Producer:{' '}
                <span className="font-semibold text-slate-900">
                  {formatFarmerIdentity(s.farmer?.farmer_profiles?.farm_name, s.farmer?.name)}
                </span>
              </p>

              <p className="text-xs text-slate-500">
                Delivery Location: <span className="text-slate-700">{s.delivery_address}</span>
              </p>

              {s.tracking_number && (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl w-fit">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Courier Tracking: {s.tracking_number}</span>
                </div>
              )}

              <p className="text-[10px] text-slate-400">
                Requested on {formatDate(s.created_at)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {s.status === 'sample_sent' && (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={updatingId === s.id}
                  onClick={() => handleApprove(s.id)}
                  leftIcon={<ThumbsUp className="w-3.5 h-3.5" />}
                >
                  Approve Quality
                </Button>
              )}

              {s.status === 'approved' && onOrderClick && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onOrderClick(s)}
                  leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                >
                  Place Bulk Order
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
