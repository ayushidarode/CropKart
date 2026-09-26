import React, { useState } from 'react';
import { Tag, ShoppingBag, Truck, IndianRupee, Bell, Check, X } from 'lucide-react';

export default function NotificationsDropdown({
  notifications = [],
  onClose,
  onMarkAllRead,
  onNotificationClick,
}) {
  const [activeTab, setActiveTab] = useState('all');

  const getIcon = (type) => {
    switch (type) {
      case 'offer':
        return { icon: Tag, color: 'bg-amber-100 text-amber-600' };
      case 'order':
        return { icon: ShoppingBag, color: 'bg-forest-100 text-forest-700' };
      case 'transport':
        return { icon: Truck, color: 'bg-steel-100 text-steel-600' };
      case 'payment':
        return { icon: IndianRupee, color: 'bg-soil-100 text-soil-600' };
      default:
        return { icon: Bell, color: 'bg-sage-100 text-forest-800' };
    }
  };

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeTab);

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-surface-0 border border-line-200 rounded-card shadow-ambient-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-3.5 bg-forest-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-lime-400" />
          <h4 className="font-display font-semibold text-sm">Notifications</h4>
          <span className="text-[10px] bg-lime-400 text-forest-900 font-bold px-2 py-0.5 rounded-pill">
            {notifications.filter((n) => !n.read).length} new
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="text-[11px] text-sage-200 hover:text-white underline underline-offset-2"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-forest-800 text-sage-200 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line-100 bg-cream-50/70 p-1 text-xs">
        {[
          { key: 'all', label: 'All' },
          { key: 'offer', label: 'Offers' },
          { key: 'order', label: 'Orders' },
          { key: 'transport', label: 'Fleet' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 rounded-pill text-[11px] font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-surface-0 text-forest-900 shadow-sm border border-line-200'
                : 'text-ink-500 hover:text-forest-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-line-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-400">
            No notifications in this tab.
          </div>
        ) : (
          filtered.map((item) => {
            const { icon: Icon, color } = getIcon(item.type);
            return (
              <div
                key={item.id}
                onClick={() => onNotificationClick && onNotificationClick(item)}
                className={`p-3.5 flex items-start gap-3 hover:bg-sage-50/70 cursor-pointer transition-colors relative ${
                  !item.read ? 'bg-lime-50/40' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-forest-900 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-ink-500 line-clamp-2 mt-0.5">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-ink-400 mt-1 block">
                    {item.time}
                  </span>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-lime-400 ring-2 ring-forest-700/20 shrink-0 mt-1" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
