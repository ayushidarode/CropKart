import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'solid-forest' | 'terracotta' | 'ghost' | 'icon'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 rounded-pill gap-1.5",
    md: "text-sm px-5 py-2.5 rounded-pill gap-2",
    lg: "text-base px-7 py-3.5 rounded-pill gap-2.5",
    icon: "p-2.5 rounded-full aspect-square",
  };

  const variantClasses = {
    // Primary Lime Pill from Orgaanic reference
    primary: "bg-lime-400 text-forest-900 hover:bg-lime-300 font-semibold focus:ring-lime-400 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0",
    // Secondary outline forest
    secondary: "border-2 border-forest-700 text-forest-700 hover:bg-forest-50 focus:ring-forest-700",
    // Solid forest
    'solid-forest': "bg-forest-700 text-white hover:bg-forest-800 focus:ring-forest-700 shadow-sm hover:shadow hover:-translate-y-0.5",
    // Destructive outline terracotta (calm, not alarmist)
    terracotta: "border border-terracotta-500 text-terracotta-500 hover:bg-terracotta-100 focus:ring-terracotta-500",
    // Solid terracotta
    'terracotta-solid': "bg-terracotta-500 text-white hover:bg-terracotta-600 focus:ring-terracotta-500",
    // Ghost
    ghost: "text-ink-500 hover:text-forest-900 hover:bg-sage-100 rounded-pill",
    // Steel accent for logistics
    steel: "bg-steel-500 text-white hover:bg-steel-600 focus:ring-steel-500 shadow-sm",
    // Icon-only lime
    'icon-lime': "bg-lime-400 text-forest-900 hover:bg-lime-300 rounded-full shadow-ambient hover:scale-105",
    // Icon-only forest
    'icon-forest': "bg-forest-700 text-white hover:bg-forest-800 rounded-full shadow-sm hover:scale-105",
    // Icon-only light
    'icon-light': "bg-surface-0 border border-line-200 text-ink-700 hover:bg-sage-50 rounded-full hover:border-forest-700",
  };

  const chosenSize = variant.startsWith('icon') ? 'icon' : size;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[chosenSize] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
