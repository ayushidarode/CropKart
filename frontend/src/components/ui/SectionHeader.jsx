import React from 'react';
import Squiggle from './Squiggle';

export default function SectionHeader({
  badge,
  title,
  subtitle,
  align = 'left', // 'left' | 'center'
  showSquiggle = true,
  className = '',
}) {
  const isCenter = align === 'center';

  return (
    <div className={`mb-8 ${isCenter ? 'text-center flex flex-col items-center' : ''} ${className}`}>
      {badge && (
        <span className="inline-block px-3.5 py-1 text-xs font-semibold tracking-wide uppercase rounded-pill bg-sage-100 text-forest-700 border border-line-200 mb-3">
          {badge}
        </span>
      )}

      <div className={`relative inline-block ${isCenter ? 'mx-auto' : ''}`}>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-forest-900 leading-tight">
          {title}
        </h2>
        {showSquiggle && (
          <div className={`mt-1.5 ${isCenter ? 'flex justify-center' : ''}`}>
            <Squiggle className="w-24 sm:w-32 h-2.5 text-lime-400" />
          </div>
        )}
      </div>

      {subtitle && (
        <p className={`mt-3 text-sm sm:text-base text-ink-500 max-w-2xl leading-relaxed ${isCenter ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
