import React from 'react';

export default function Squiggle({ className = "w-32 h-3 text-lime-400", strokeWidth = 3 }) {
  return (
    <svg
      viewBox="0 0 140 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M2 9C20 3 25 15 45 9C65 3 70 15 90 9C110 3 118 14 138 8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
