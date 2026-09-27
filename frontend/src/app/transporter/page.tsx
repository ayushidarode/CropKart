'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getTransporterJobs, updateTransportStatus } from '@/lib/api/transport';
import { TransportWithOrder } from '@/types/transport';
import { RouteOptimizationPanel } from '@/components/transporter/RouteOptimizationPanel';
import { StatTile } from '@/components/ui/StatTile';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Truck, MapPin, Check, Navigation, AlertCircle, Clock } from 'lucide-react';
import { TransportStatus } from '@/types/database';

export default function TransporterDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<TransportWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getTransporterJobs(user.id);
      setJobs(data);
    } catch (err) {
      console.error('Error fetching transporter jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleUpdateStatus = async (jobId: string, status: TransportStatus) => {
    setUpdatingId(jobId);
    await updateTransportStatus(jobId, status);
    setUpdatingId(null);
    fetchJobs();
  };

  const activeJobs = jobs.filter((j) => j.status !== 'delivered' && j.status !== 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="amber">ROUTE ASSIGNED</Badge>;
      case 'accepted':
        return <Badge variant="blue">ACCEPTED</Badge>;
      case 'picked_up':
        return <Badge variant="amber">LOADED AT FARM GATE</Badge>;
      case 'in_transit':
        return <Badge variant="blue">ON HIGHWAY IN-TRANSIT</Badge>;
      case 'delivered':
        return <Badge variant="emerald">DELIVERED & SIGNED</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Truck className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge variant="emerald">Logistics & Freight Portal</Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Transporter Logistics Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accept agricultural hauling dispatches, advance pickup milestones, and monitor highway routes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Vehicle: {user?.transporter_profile?.vehicle_type || 'Eicher 14ft Canter (8.5T)'}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile
          title="Active Logistics Jobs"
          value={activeJobs.length}
          subtitle="Assigned loads in transit"
          icon={<Truck className="w-5 h-5" />}
          color="emerald"
        />
        <StatTile
          title="Vehicle Payload"
          value={`${user?.transporter_profile?.capacity_tonnes || 8.5} Tonnes`}
          subtitle="Commercial cargo capacity"
          icon={<Navigation className="w-5 h-5" />}
          color="blue"
        />
        <StatTile
          title="Completed Trips"
          value={jobs.filter((j) => j.status === 'delivered').length}
          subtitle="Verified mandi arrivals"
          icon={<Check className="w-5 h-5" />}
          color="amber"
        />
        <StatTile
          title="Freight Revenue"
          value={formatCurrency(
            jobs.reduce((acc, j) => acc + (j.cost || 0), 0)
          )}
          subtitle="Settled & in-transit"
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Route Optimization Panel Component */}
      <RouteOptimizationPanel
        origin={jobs[0]?.pickup_location || 'Baramati, Pune'}
        destination={jobs[0]?.delivery_location || 'Vashi APMC, Navi Mumbai'}
        distanceKm={jobs[0]?.distance_km || 225}
        durationHours={jobs[0]?.estimated_hours || 5.5}
        estimatedCost={jobs[0]?.cost || 6500}
        vehicle={user?.transporter_profile?.vehicle_type || 'Eicher 14ft Canter'}
      />

      {/* Assigned Jobs List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900">
          Assigned Cargo Shipments ({jobs.length})
        </h4>

        {isLoading ? (
          <LoadingState message="Connecting to Supabase transport assignments..." />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Truck className="w-8 h-8" />}
            title="No Logistics Jobs Assigned"
            description="When buyers and farmers finalize bulk contracts, delivery dispatches will appear here."
          />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      Order #{job.order?.order_number || 'CK-BATCH'}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {job.order?.crop_name || 'Agricultural Freight'} — {job.order?.quantity} {job.order?.unit || 'kg'}
                    </span>
                    {getStatusBadge(job.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Farm Pickup: <strong className="text-slate-900">{job.pickup_location}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Delivery: <strong className="text-slate-900">{job.delivery_location}</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-50">
                    <span>Distance: <strong>{job.distance_km || 200} km</strong></span>
                    <span>Transit: <strong>{job.estimated_hours || 5} hrs</strong></span>
                    <span>Freight Pay: <strong className="text-emerald-800">{formatCurrency(job.cost || 6000)}</strong></span>
                  </div>
                </div>

                {/* Status Advancement Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  {job.status === 'assigned' && (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={updatingId === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'accepted')}
                    >
                      Accept Assignment
                    </Button>
                  )}

                  {job.status === 'accepted' && (
                    <Button
                      size="sm"
                      variant="amber"
                      isLoading={updatingId === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'picked_up')}
                    >
                      Confirm Farm Pickup
                    </Button>
                  )}

                  {job.status === 'picked_up' && (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={updatingId === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'in_transit')}
                    >
                      Depart on Highway
                    </Button>
                  )}

                  {job.status === 'in_transit' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      isLoading={updatingId === job.id}
                      onClick={() => handleUpdateStatus(job.id, 'delivered')}
                      leftIcon={<Check className="w-4 h-4 text-emerald-700" />}
                    >
                      Mark Successfully Delivered
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
