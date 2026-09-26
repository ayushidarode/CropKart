import React from 'react';
import { Check, Clock, Truck, CheckCircle2, IndianRupee } from 'lucide-react';

const STEPS = [
  { id: 'placed', label: 'Placed', icon: Clock },
  { id: 'accepted', label: 'Accepted', icon: Check },
  { id: 'in-transit', label: 'In Transit', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  { id: 'paid', label: 'Paid', icon: IndianRupee },
];

export default function OrderStepper({ currentStatus = 'placed', onStepClick }) {
  const normalizedStatus = (currentStatus || 'placed').toLowerCase().replace(/\s+/g, '-');
  
  const getStepIndex = (status) => {
    switch (status) {
      case 'placed': return 0;
      case 'accepted': return 1;
      case 'in-transit': return 2;
      case 'delivered': return 3;
      case 'paid': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(normalizedStatus);

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-line-200 -z-0" />
        
        {/* Active progress connector line */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-forest-500 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 92}%` }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => onStepClick && onStepClick(step.id)}
              className={`flex flex-col items-center relative z-10 ${onStepClick ? 'cursor-pointer' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-forest-500 text-white ring-4 ring-cream-50'
                    : isCurrent
                    ? 'bg-forest-700 text-lime-300 ring-4 ring-lime-100 shadow-sm scale-110'
                    : 'bg-surface-0 border-2 border-line-200 text-ink-400 ring-4 ring-cream-50'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-forest-900 font-bold'
                    : isCompleted
                    ? 'text-forest-700'
                    : 'text-ink-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
