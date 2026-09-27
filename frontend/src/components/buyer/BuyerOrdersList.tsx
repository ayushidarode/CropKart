'use client';

import React from 'react';
import { OrderWithDetails } from '@/types/order';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, formatFarmerIdentity } from '@/lib/utils';
import { ShoppingBag, Truck, MapPin, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function BuyerOrdersList({ orders }: { orders: OrderWithDetails[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="w-8 h-8" />}
        title="No Orders Placed Yet"
        description="Browse the marketplace or request crop samples to initiate wholesale contracts."
        actionLabel="Explore Marketplace"
        onAction={() => {}}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="amber">AWAITING FARMER CONFIRMATION</Badge>;
      case 'accepted':
        return <Badge variant="blue">ACCEPTED BY FARMER</Badge>;
      case 'ready_for_pickup':
        return <Badge variant="amber">READY AT FARM GATE</Badge>;
      case 'in_transit':
        return <Badge variant="blue">OUT FOR DELIVERY</Badge>;
      case 'delivered':
        return <Badge variant="emerald">DELIVERED & VERIFIED</Badge>;
      case 'cancelled':
        return <Badge variant="rose">CANCELLED</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">
          Your Bulk Procurement Orders ({orders.length})
        </h4>
        <Link href="/marketplace">
          <Button size="sm" variant="outline">
            Buy More Crops
          </Button>
        </Link>
      </div>

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
                  {o.crop?.name || 'Crop Produce'} — {o.quantity.toLocaleString('en-IN')} {o.unit}
                </span>
                {getStatusBadge(o.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <p>
                  Farmer:{' '}
                  <span className="font-bold text-slate-900">
                    {formatFarmerIdentity(o.farmer?.farmer_profiles?.farm_name, o.farmer?.name)}
                  </span>
                </p>
                <p>
                  Contract Total:{' '}
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

              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                <span>Ordered: {formatDate(o.created_at)}</span>
                <span>Payment: <strong className="text-emerald-700 capitalize">{o.payment_status}</strong> via {o.payment_method.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center w-full md:w-36">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Price Rate
                </p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  ₹{o.price_per_unit}/{o.unit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
