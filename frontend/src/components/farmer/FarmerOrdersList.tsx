'use client';

import React, { useState } from 'react';
import { OrderWithDetails } from '@/types/order';
import { updateOrderStatus } from '@/lib/api/orders';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Check, Truck, ShoppingCart, MapPin, IndianRupee } from 'lucide-react';
import { OrderStatus } from '@/types/database';

export function FarmerOrdersList({
  orders,
  onRefresh,
}: {
  orders: OrderWithDetails[];
  onRefresh: () => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, status);
    setUpdatingId(null);
    onRefresh();
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="w-8 h-8" />}
        title="No Bulk Orders Received Yet"
        description="When buyers approve samples and place bulk purchase orders, they will show up here for trade fulfillment."
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="amber">NEW ORDER</Badge>;
      case 'accepted':
        return <Badge variant="blue">ACCEPTED</Badge>;
      case 'ready_for_pickup':
        return <Badge variant="emerald">READY FOR PICKUP</Badge>;
      case 'in_transit':
        return <Badge variant="blue">IN TRANSIT</Badge>;
      case 'delivered':
        return <Badge variant="emerald">DELIVERED</Badge>;
      case 'cancelled':
        return <Badge variant="rose">CANCELLED</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900">
        Bulk Trade Purchase Contracts ({orders.length})
      </h4>

      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  #{o.order_number}
                </span>
                <span className="text-base font-black text-slate-900">
                  {o.crop?.name || 'Crop Batch'} — {o.quantity.toLocaleString('en-IN')} {o.unit}
                </span>
                {getStatusBadge(o.status)}
                <Badge variant={o.payment_status === 'paid' ? 'emerald' : 'amber'} size="sm">
                  {o.payment_status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <p>
                  Buyer:{' '}
                  <span className="font-bold text-slate-900">
                    {o.buyer?.buyer_profiles?.company_name || o.buyer?.name || 'Wholesale Buyer'}
                  </span>
                </p>
                <p className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                  Total Contract:{' '}
                  <span className="font-black text-emerald-800 text-sm">
                    {formatCurrency(o.total_price)}
                  </span>
                </p>
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-50">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Pickup: {o.pickup_location}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Destination: {o.delivery_location}</span>
                </p>
              </div>

              <p className="text-[10px] text-slate-400">
                Contract issued on {formatDate(o.created_at)}
              </p>
            </div>

            {/* Status update actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {o.status === 'pending' && (
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={updatingId === o.id}
                  onClick={() => handleUpdate(o.id, 'accepted')}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Accept Order
                </Button>
              )}

              {o.status === 'accepted' && (
                <Button
                  size="sm"
                  variant="amber"
                  isLoading={updatingId === o.id}
                  onClick={() => handleUpdate(o.id, 'ready_for_pickup')}
                  leftIcon={<Truck className="w-3.5 h-3.5" />}
                >
                  Mark Ready for Pickup
                </Button>
              )}

              {o.status === 'ready_for_pickup' && (
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={updatingId === o.id}
                  onClick={() => handleUpdate(o.id, 'in_transit')}
                >
                  Confirm Transporter Pickup
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
