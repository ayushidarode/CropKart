'use client';

import React, { useState } from 'react';
import { SampleRequestWithDetails } from '@/types/sample';
import { updateSampleStatus } from '@/lib/api/samples';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { Check, X, Truck, Package, Clock } from 'lucide-react';
import { SampleRequestStatus } from '@/types/database';

export function FarmerSamplesList({
  samples,
  onRefresh,
}: {
  samples: SampleRequestWithDetails[];
  onRefresh: () => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const handleStatusChange = async (
    sampleId: string,
    status: SampleRequestStatus,
    trackingNumber?: string
  ) => {
    setUpdatingId(sampleId);
    await updateSampleStatus(sampleId, status, trackingNumber);
    setUpdatingId(null);
    onRefresh();
  };

  if (samples.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-8 h-8" />}
        title="No Sample Requests Yet"
        description="When wholesale buyers or processors evaluate your crop listings, their verification sample requests will appear here."
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sample_requested':
        return <Badge variant="amber">NEW REQUEST</Badge>;
      case 'sample_accepted':
        return <Badge variant="blue">ACCEPTED</Badge>;
      case 'sample_sent':
        return <Badge variant="emerald">DISPATCHED</Badge>;
      case 'approved':
        return <Badge variant="emerald">SAMPLE APPROVED</Badge>;
      case 'rejected':
      case 'sample_rejected':
        return <Badge variant="rose">REJECTED</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900">
        Incoming Verification Sample Requests ({samples.length})
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
                  {s.crop?.name || 'Crop Sample'} ({s.quantity} {s.unit})
                </span>
                {getStatusBadge(s.status)}
              </div>

              <p className="text-xs text-slate-600">
                Buyer:{' '}
                <span className="font-semibold text-slate-900">
                  {s.buyer?.buyer_profiles?.company_name || s.buyer?.name || 'Wholesale Buyer'}
                </span>
                {s.buyer?.mobile && ` · ${s.buyer.mobile}`}
              </p>

              <p className="text-xs text-slate-500">
                Address: <span className="text-slate-700">{s.delivery_address}</span>
              </p>

              {s.notes && (
                <p className="text-xs italic text-slate-500 bg-slate-50 p-2 rounded-lg">
                  &ldquo;{s.notes}&rdquo;
                </p>
              )}

              {s.tracking_number && (
                <p className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Tracking: {s.tracking_number}
                </p>
              )}

              <p className="text-[10px] text-slate-400 font-medium">
                Requested on {formatDate(s.created_at)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {s.status === 'sample_requested' && (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={updatingId === s.id}
                    onClick={() => handleStatusChange(s.id, 'sample_accepted')}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={updatingId === s.id}
                    onClick={() => handleStatusChange(s.id, 'sample_rejected')}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Decline
                  </Button>
                </>
              )}

              {s.status === 'sample_accepted' && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Courier AWB Tracking #"
                    value={trackingInputs[s.id] || ''}
                    onChange={(e) =>
                      setTrackingInputs({ ...trackingInputs, [s.id]: e.target.value })
                    }
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={updatingId === s.id}
                    onClick={() =>
                      handleStatusChange(s.id, 'sample_sent', trackingInputs[s.id] || 'DTDC-DISPATCH')
                    }
                    leftIcon={<Truck className="w-3.5 h-3.5" />}
                  >
                    Mark Dispatched
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
