'use client';

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatDate } from '@/lib/utils';
import { Bell, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Bell className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge variant="emerald">Live Platform Feed</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications & System Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time trade updates, sample dispatch notices, and contract milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllAsRead}
            leftIcon={<Check className="w-4 h-4 text-emerald-700" />}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState message="Loading notifications from Supabase..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No Notifications"
          description="You are fully caught up! New trade actions will trigger real-time updates."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 sm:p-5 transition-all ${
                !n.is_read ? 'bg-emerald-50/30 border-emerald-200/80 shadow-sm' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                    )}
                    <Badge variant="slate" size="sm">
                      {n.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {formatDate(n.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Mark read
                    </Button>
                  )}
                  {n.link && (
                    <Link href={n.link} onClick={() => markAsRead(n.id)}>
                      <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
