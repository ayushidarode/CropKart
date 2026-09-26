import React from 'react';
import { MapPin, UserCheck, ShieldCheck, Heart } from 'lucide-react';
import StatusPill from './StatusPill';
import Button from './Button';

export default function CropCard({
  crop,
  onSelect,
  onMakeOffer,
  onBuyNow,
  isFavorite = false,
  onToggleFavorite,
}) {
  const {
    id,
    name,
    variety,
    price,
    unit = 'quintal',
    quantity,
    quantityUnit = 'qtl',
    farmerName,
    location,
    grade = 'Grade A+',
    imageUrl,
    status = 'listed',
    harvestDate,
  } = crop;

  return (
    <div className="group bg-surface-0 border border-line-200 hover:border-forest-700/40 rounded-card overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-all duration-200 flex flex-col justify-between">
      {/* Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sage-100">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <StatusPill status="grade-a" label={grade} size="xs" />
          {status && status !== 'listed' && (
            <StatusPill status={status} size="xs" />
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(id);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-0/90 backdrop-blur-sm flex items-center justify-center text-ink-500 hover:text-terracotta-500 transition-colors shadow-sm z-10"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? 'fill-terracotta-500 text-terracotta-500' : ''}`}
            />
          </button>
        )}

        {/* Quantity overlay */}
        <div className="absolute bottom-2 left-2.5 bg-forest-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-pill text-xs font-semibold tabular-nums">
          {quantity} {quantityUnit} avail.
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              onClick={() => onSelect && onSelect(crop)}
              className="font-display font-bold text-lg text-forest-900 group-hover:text-forest-700 transition-colors cursor-pointer"
            >
              {name}
            </h3>
            {variety && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-sage-100 text-forest-700">
                {variety}
              </span>
            )}
          </div>

          {/* Farmer & Location info */}
          <div className="flex items-center gap-3 text-xs text-ink-500 mb-3">
            <span className="inline-flex items-center gap-1 font-medium text-ink-700 truncate">
              <UserCheck className="w-3.5 h-3.5 text-forest-600 shrink-0" />
              {farmerName}
            </span>
            <span className="inline-flex items-center gap-1 text-ink-500 truncate">
              <MapPin className="w-3.5 h-3.5 text-steel-500 shrink-0" />
              {location}
            </span>
          </div>

          {harvestDate && (
            <div className="text-[11px] text-ink-400 mb-3">
              Harvested: <span className="text-ink-600 font-medium">{harvestDate}</span>
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-line-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
              Wholesale Price
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-forest-900 tabular-nums">
                ₹{Number(price).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-ink-500">/{unit}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onMakeOffer && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onMakeOffer(crop)}
                className="text-xs px-3 py-1.5"
              >
                Offer
              </Button>
            )}
            <Button
              variant="solid-forest"
              size="sm"
              onClick={() => onSelect ? onSelect(crop) : onBuyNow && onBuyNow(crop)}
              className="text-xs px-3 py-1.5"
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
