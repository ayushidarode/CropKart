import React from 'react';

export default function StatusPill({ status = 'listed', label, size = 'sm', className = '' }) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '-');

  const configs = {
    // Marketplace Crop status
    'listed': {
      bg: 'bg-forest-50 text-forest-700 border-forest-100',
      dot: 'bg-forest-500',
      text: label || 'Listed'
    },
    'available': {
      bg: 'bg-forest-50 text-forest-700 border-forest-100',
      dot: 'bg-forest-500',
      text: label || 'Available'
    },
    'under-offer': {
      bg: 'bg-amber-100 text-amber-600 border-amber-200',
      dot: 'bg-amber-500',
      text: label || 'Under Offer'
    },
    'sold': {
      bg: 'bg-ink-100 text-ink-700 border-ink-200',
      dot: 'bg-ink-500',
      text: label || 'Sold Out'
    },
    // Order Lifecycle
    'placed': {
      bg: 'bg-sage-100 text-forest-900 border-sage-200',
      dot: 'bg-forest-700',
      text: label || 'Order Placed'
    },
    'pending': {
      bg: 'bg-amber-100 text-amber-600 border-amber-200',
      dot: 'bg-amber-500',
      text: label || 'Pending'
    },
    'accepted': {
      bg: 'bg-forest-100 text-forest-700 border-forest-300',
      dot: 'bg-forest-500',
      text: label || 'Accepted'
    },
    'in-transit': {
      bg: 'bg-steel-100 text-steel-600 border-steel-200',
      dot: 'bg-steel-500 animate-pulse',
      text: label || 'In Transit'
    },
    'delivered': {
      bg: 'bg-lime-100 text-forest-900 border-lime-300',
      dot: 'bg-forest-600',
      text: label || 'Delivered'
    },
    'paid': {
      bg: 'bg-forest-100 text-forest-800 border-forest-300',
      dot: 'bg-forest-700',
      text: label || 'Paid'
    },
    'rejected': {
      bg: 'bg-terracotta-100 text-terracotta-600 border-terracotta-200',
      dot: 'bg-terracotta-500',
      text: label || 'Rejected'
    },
    // Quality & badges
    'grade-a': {
      bg: 'bg-soil-100 text-soil-600 border-soil-200',
      dot: 'bg-soil-600',
      text: label || 'Grade A+'
    },
    'organic': {
      bg: 'bg-lime-100 text-forest-900 border-lime-300',
      dot: 'bg-forest-500',
      text: label || 'Organic Certified'
    },
    'verified': {
      bg: 'bg-forest-50 text-forest-700 border-forest-200',
      dot: 'bg-forest-700',
      text: label || 'Verified'
    },
  };

  const current = configs[normalized] || {
    bg: 'bg-sage-100 text-ink-700 border-line-200',
    dot: 'bg-ink-500',
    text: label || status
  };

  const sizeClasses = {
    xs: 'text-[11px] px-2.5 py-0.5',
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-3.5 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-pill border ${current.bg} ${sizeClasses[size] || sizeClasses.sm} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{current.text}</span>
    </span>
  );
}
