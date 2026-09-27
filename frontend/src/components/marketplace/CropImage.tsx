'use client';

import React, { useState } from 'react';
import { getCropImage, getCropIcon } from '@/lib/constants';

export interface CropImageProps {
  name: string;
  category?: string;
  src?: string | null;
  className?: string;
  aspectRatio?: string;
}

export function CropImage({
  name,
  category,
  src,
  className = '',
  aspectRatio = 'aspect-[4/3]',
}: CropImageProps) {
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = getCropImage(name, src);

  if (imgError) {
    return (
      <div
        className={`w-full ${aspectRatio} bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50 flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
      >
        <span className="text-4xl filter drop-shadow-sm mb-1">{getCropIcon(name, category)}</span>
        <span className="text-xs font-bold text-emerald-950 capitalize">{name}</span>
        {category && <span className="text-[10px] text-emerald-700/80 font-medium">{category}</span>}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden bg-slate-100 ${className}`}>
      <img
        src={fallbackUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
  );
}
