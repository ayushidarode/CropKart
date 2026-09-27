'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFarmerPublicProfile } from '@/lib/api/users';
import { getFarmerCrops } from '@/lib/api/crops';
import { FarmerWithProfile } from '@/types/user';
import { CropWithFarmer } from '@/types/crop';
import { CropCard } from '@/components/marketplace/CropCard';
import { SampleRequestModal } from '@/components/marketplace/SampleRequestModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  ShieldCheck,
  MapPin,
  Star,
  Award,
  Layers,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Wheat,
} from 'lucide-react';

export default function FarmerPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [profile, setProfile] = useState<FarmerWithProfile | null>(null);
  const [crops, setCrops] = useState<CropWithFarmer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCropForSample, setSelectedCropForSample] = useState<CropWithFarmer | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const [profileData, cropsData] = await Promise.all([
          getFarmerPublicProfile(id),
          getFarmerCrops(id),
        ]);
        setProfile(profileData);
        setCrops(cropsData);
      } catch (err) {
        console.error('Error fetching farmer profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingState message="Loading producer credentials and verification records..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <ErrorState
          title="Producer profile not found"
          message="Could not find verified producer records for this identifier."
          onRetry={() => router.push('/marketplace')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      {/* Profile Header Banner */}
      <Card className="p-6 sm:p-8 border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={
              profile.avatar_url ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop'
            }
            alt={profile.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {profile.farm_name}
              </h1>
              {profile.is_verified && (
                <Badge variant="emerald" className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified Producer</span>
                </Badge>
              )}
            </div>

            <p className="text-sm font-bold text-slate-700">
              Proprietor: <span className="text-emerald-800">{profile.name}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile.location || `${profile.district}, ${profile.state}`}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {profile.years_active} years in agricultural trade
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {profile.rating} ({profile.review_count} verified buyer ratings)
              </span>
            </div>

            {profile.bio && (
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed pt-2">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Verification Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cultivation</span>
            <strong className="text-sm font-black text-slate-900 block mt-0.5">
              {profile.total_acres} Acres Land
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Mode</span>
            <strong className="text-sm font-black text-emerald-800 block mt-0.5 font-mono">
              {profile.upi_id || 'UPI / RTGS'}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sampling</span>
            <strong className="text-sm font-black text-slate-900 block mt-0.5">
              Courier Enabled
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Listings</span>
            <strong className="text-sm font-black text-slate-900 block mt-0.5">
              {crops.length} Lots Live
            </strong>
          </div>
        </div>
      </Card>

      {/* Producer's Live Harvest Produce */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-black text-slate-900">
              Harvest Produce by {profile.farm_name} ({crops.length})
            </h3>
          </div>
        </div>

        {crops.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 p-6 text-xs text-slate-500">
            No active crop listings currently available from this producer.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onRequestSample={(c) => setSelectedCropForSample(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sample Request Modal */}
      <SampleRequestModal
        crop={selectedCropForSample}
        isOpen={Boolean(selectedCropForSample)}
        onClose={() => setSelectedCropForSample(null)}
      />
    </div>
  );
}
