import React, { useState } from 'react';
import { Search, Bell, Sparkles, User, Menu, Globe, ChevronDown } from 'lucide-react';
import NotificationsDropdown from '../NotificationsDropdown';

export default function Topbar({
  user,
  currentRole,
  onSwitchRole,
  notifications = [],
  onMarkAllNotificationsRead,
  onOpenCropSathi,
  language,
  setLanguage,
  searchQuery,
  setSearchQuery,
  onToggleMobileNav,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-surface-0 border-b border-line-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-xl text-ink-700 hover:bg-sage-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search crops, APMC mandi rates, orders, transporters..."
            className="w-full bg-cream-50/80 border border-line-200 hover:border-forest-700/30 rounded-pill pl-9 pr-4 py-2 text-xs sm:text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-surface-0 transition-all placeholder:text-ink-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Segmented Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-pill border border-line-200 bg-surface-0 hover:bg-sage-50 text-xs font-semibold text-ink-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-forest-700" />
            <span>{language || 'EN'}</span>
            <ChevronDown className="w-3 h-3 text-ink-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-10 bg-surface-0 border border-line-200 rounded-xl shadow-ambient py-1.5 w-28 z-30">
              {[
                { code: 'EN', label: 'English' },
                { code: 'हिं', label: 'हिंदी' },
                { code: 'मर', label: 'मराठी' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLanguage(item.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-sage-100 flex items-center justify-between ${
                    language === item.code ? 'font-bold text-forest-700 bg-lime-50' : 'text-ink-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-ink-400">{item.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-full bg-cream-50 border border-line-200 flex items-center justify-center text-ink-700 hover:text-forest-900 hover:bg-sage-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-lime-400 ring-2 ring-surface-0 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <NotificationsDropdown
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkAllRead={onMarkAllNotificationsRead}
              onNotificationClick={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* AI Quick Button on Topbar */}
        <button
          onClick={onOpenCropSathi}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-lime-400 hover:bg-lime-300 text-forest-900 text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>CropSathi AI</span>
        </button>

        {/* User Pill / Role Display */}
        <div className="flex items-center gap-2 pl-2 border-l border-line-200">
          <div className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {(user?.name || 'R')[0]}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-forest-900 block leading-tight">
              {user?.name || 'Ramesh Patel'}
            </span>
            <span className="text-[10px] text-soil-600 uppercase font-semibold tracking-wider block">
              {currentRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
