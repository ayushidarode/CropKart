import React from 'react';
import { ArrowRight, MapPin, Truck, IndianRupee, FileText, ChevronRight } from 'lucide-react';
import StatusPill from './StatusPill';
import OrderStepper from './OrderStepper';
import Button from './Button';

export default function OrderCard({
  order,
  onViewDetails,
  onAssignTransport,
  onTrackMap,
  onUpdateStatus,
}) {
  const {
    id,
    orderNumber = `CK-ORD-${id}`,
    cropName,
    farmerName,
    farmerLocation,
    buyerName,
    buyerLocation,
    quantity,
    unit = 'quintal',
    agreedPrice,
    totalAmount = agreedPrice * quantity,
    status = 'placed',
    transporterName,
    transporterVehicle,
    createdAt = 'Today',
    estimatedDelivery = 'In 2 days',
  } = order;

  return (
    <div className="bg-surface-0 border border-line-200 rounded-card p-5 shadow-ambient hover:shadow-ambient-lg transition-all duration-200">
      {/* Top row: Order ID, date, Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line-100">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-forest-700 bg-sage-100 px-2.5 py-1 rounded-md">
            {orderNumber}
          </span>
          <span className="text-xs text-ink-400">Created: {createdAt}</span>
        </div>
        <StatusPill status={status} size="sm" />
      </div>

      {/* Middle row: Crop details & Trade counterparties */}
      <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Crop info */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Crop Commodity</span>
          <h4 className="font-display text-lg font-bold text-forest-900 mt-0.5">
            {cropName}
          </h4>
          <p className="text-xs text-ink-600 mt-0.5 tabular-nums">
            {quantity} {unit} @ ₹{Number(agreedPrice).toLocaleString('en-IN')}/{unit}
          </p>
        </div>

        {/* Counterparty Arrow Flow */}
        <div className="bg-cream-50/80 rounded-xl p-3 border border-line-100">
          <div className="flex items-center justify-between text-xs font-medium text-ink-700">
            <div className="truncate">
              <span className="text-[10px] text-soil-600 uppercase block font-bold">Farmer</span>
              <span className="font-semibold text-forest-900 truncate block">{farmerName}</span>
              <span className="text-[10px] text-ink-400 truncate block">{farmerLocation || 'Nashik'}</span>
            </div>

            <div className="px-2 text-forest-700 flex flex-col items-center">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[9px] uppercase font-bold text-lime-600">Dispatched</span>
            </div>

            <div className="truncate text-right">
              <span className="text-[10px] text-steel-500 uppercase block font-bold">Buyer</span>
              <span className="font-semibold text-forest-900 truncate block">{buyerName}</span>
              <span className="text-[10px] text-ink-400 truncate block">{buyerLocation || 'Mumbai APMC'}</span>
            </div>
          </div>
        </div>

        {/* Agreed Total */}
        <div className="text-left md:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Total Settlement</span>
          <div className="text-xl sm:text-2xl font-bold text-forest-900 tabular-nums">
            ₹{Number(totalAmount).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-forest-600 font-medium">
            {status === 'paid' ? 'Paid via Escrow' : 'Escrow Secured'}
          </span>
        </div>
      </div>

      {/* 5-State Horizontal Stepper */}
      <div className="pt-2 pb-3">
        <OrderStepper
          currentStatus={status}
          onStepClick={(step) => onUpdateStatus && onUpdateStatus(id, step)}
        />
      </div>

      {/* Transporter snippet if assigned */}
      {transporterName && (
        <div className="mt-2 mb-3 px-3.5 py-2 rounded-xl bg-steel-50 border border-steel-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-steel-600" />
            <span className="text-ink-700">
              Assigned Fleet: <strong className="text-steel-600">{transporterName}</strong> ({transporterVehicle})
            </span>
          </div>
          <span className="text-ink-500 font-medium">{estimatedDelivery}</span>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="pt-3 border-t border-line-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onTrackMap && (
            <Button
              variant="secondary"
              size="sm"
              icon={MapPin}
              onClick={() => onTrackMap(order)}
              className="text-xs"
            >
              Live Route Map
            </Button>
          )}
          {!transporterName && onAssignTransport && (
            <Button
              variant="steel"
              size="sm"
              icon={Truck}
              onClick={() => onAssignTransport(order)}
              className="text-xs"
            >
              Assign Transporter
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(order)}
              className="text-xs text-forest-700"
            >
              Order Details
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
