import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'emerald',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    blue: 'bg-sky-50 text-sky-800 border border-sky-200/60',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200/60',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    outline: 'bg-transparent text-slate-700 border border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full tracking-wide ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
