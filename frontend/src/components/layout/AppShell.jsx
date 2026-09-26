import React, { useState } from 'react';
import { Sparkles, MessageCircle, Leaf } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileTabBar from './MobileTabBar';
import CropSathiAssistant from '../CropSathiAssistant';

export default function AppShell({
  children,
  user,
  currentRole,
  onSwitchRole,
  notifications = [],
  onMarkAllNotificationsRead,
  language,
  setLanguage,
  searchQuery,
  setSearchQuery,
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCropSathiOpen, setIsCropSathiOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-cream-50 text-ink-900 font-sans selection:bg-lime-200">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
        currentRole={currentRole}
        onSwitchRole={onSwitchRole}
        onOpenCropSathi={() => setIsCropSathiOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar
          user={user}
          currentRole={currentRole}
          onSwitchRole={onSwitchRole}
          notifications={notifications}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onOpenCropSathi={() => setIsCropSathiOpen(true)}
          language={language}
          setLanguage={setLanguage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileNav={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>

      {/* Persistent Floating CropSathi Action Button */}
      <div className="fixed bottom-20 md:bottom-6 right-5 z-40">
        <button
          onClick={() => setIsCropSathiOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-lime-400 hover:bg-lime-300 text-forest-900 shadow-ambient-lg hover:shadow-ambient-xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-forest-900"
          title="Ask CropSathi AI"
        >
          <Leaf className="w-6 h-6 stroke-[2.5] text-forest-900 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-forest-700 ring-2 ring-cream-50 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
          </span>
        </button>
      </div>

      {/* Slide-over CropSathi Drawer */}
      <CropSathiAssistant
        isOpen={isCropSathiOpen}
        onClose={() => setIsCropSathiOpen(false)}
        currentRole={currentRole}
      />

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        currentRole={currentRole}
        onOpenCropSathi={() => setIsCropSathiOpen(true)}
      />
    </div>
  );
}
