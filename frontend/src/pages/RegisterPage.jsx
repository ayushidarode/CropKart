import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Store, Truck, ArrowRight, ShieldCheck, CheckCircle2, Leaf } from 'lucide-react';
import MarketingShell from '../components/layout/MarketingShell';
import RoleCard from '../components/ui/RoleCard';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import { useApp } from '../context/AppContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { currentRole, switchRole } = useApp();

  const [step, setStep] = useState(1); // 1 = Details / Tabbed, 2 = Role Selection
  const [selectedRole, setSelectedRole] = useState(currentRole || 'farmer');
  const [formData, setFormData] = useState({
    name: 'Ramesh Patel',
    phone: '+91 98231 44512',
    location: 'Nashik, Maharashtra',
    password: '••••••••',
  });

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setStep(2); // Advance to the Role Selection step
  };

  const handleRoleConfirm = () => {
    switchRole(selectedRole);
    if (selectedRole === 'farmer') {
      navigate('/farmer/dashboard');
    } else if (selectedRole === 'transporter') {
      navigate('/logistics');
    } else {
      navigate('/buyer/dashboard');
    }
  };

  return (
    <MarketingShell>
      <div className="py-12 sm:py-16 px-4 max-w-5xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            onClick={() => setStep(1)}
            className={`cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-semibold transition-all ${
              step === 1
                ? 'bg-forest-700 text-white'
                : 'bg-sage-100 text-forest-700 hover:bg-sage-200'
            }`}
          >
            <span>1</span>
            <span>Account Details</span>
          </div>
          <div className="w-8 h-0.5 bg-line-200" />
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-semibold transition-all ${
              step === 2
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-sage-100 text-ink-500'
            }`}
          >
            <span>2</span>
            <span>Select Stakeholder Role</span>
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Tabbed Login / Register Card */
          <div className="max-w-md mx-auto bg-surface-0 border border-line-200 rounded-hero p-6 sm:p-8 shadow-ambient">
            {/* Tab switch between Login and Register */}
            <div className="flex bg-cream-50 p-1 rounded-pill mb-6 border border-line-100 text-xs font-semibold">
              <Link to="/login" className="flex-1 py-2 text-center rounded-pill text-ink-500 hover:text-forest-900 transition-colors">
                Sign In
              </Link>
              <div className="flex-1 py-2 text-center rounded-pill bg-surface-0 text-forest-900 font-bold shadow-sm">
                Register Free
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-display font-bold text-2xl text-forest-900 mb-1">
                Create CropKart Account
              </h2>
              <p className="text-xs text-ink-500">
                Join 48,500+ verified agri stakeholders across India.
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  Full Name / Enterprise Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel or Metro Wholesale"
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  Mobile Number (Kisan OTP Verification)
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  District / State Mandi Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Nashik, Maharashtra"
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  Security Password / PIN
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create secure password"
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full py-3"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Next: Select Role
                </Button>
              </div>

              <p className="text-[11px] text-ink-400 text-center pt-2">
                By continuing, you agree to CropKart B2B Mandi Terms & Escrow Protections.
              </p>
            </form>
          </div>
        ) : (
          /* Step 2: Role Selection Step (§5.2 - Most screenshotted screen) */
          <div>
            <SectionHeader
              badge="SIH Demo Flow • Step 2"
              title="Select Your Stakeholder Role"
              subtitle="Choose the persona you wish to operate as. You can switch roles anytime from the sidebar during the demo."
              align="center"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Farmer Card */}
              <RoleCard
                number="01"
                roleKey="farmer"
                title="Farmer (Kisan)"
                subtitle="Seller & Producer"
                description="List fresh harvest lots, set minimum acceptable rates, receive buyer bids, and accept orders with guaranteed escrow release."
                icon={Wheat}
                features={[
                  'Instant Crop Listing with Photo Upload',
                  'Direct Buyer Bids & Price Negotiation',
                  'Free Access to CropSathi APMC Rates',
                ]}
                isSelected={selectedRole === 'farmer'}
                onSelect={(r) => setSelectedRole(r)}
              />

              {/* Buyer Card */}
              <RoleCard
                number="02"
                roleKey="buyer"
                title="Wholesale Buyer"
                subtitle="Retailer / Mill / Exporter"
                description="Explore verified farm produce across 28 mandis, filter by grade and moisture, submit price offers, and track delivery live."
                icon={Store}
                features={[
                  'Tabular Mandi Price Comparison',
                  'One-Click Counter-Offer Submissions',
                  'Escrow Protected Payment Release',
                ]}
                isSelected={selectedRole === 'buyer'}
                onSelect={(r) => setSelectedRole(r)}
              />

              {/* Transporter Card */}
              <RoleCard
                number="03"
                roleKey="transporter"
                title="Transporter Fleet"
                subtitle="Logistics & Dispatch"
                description="Accept farm-to-mandi cargo requests, leverage AI route optimization to reduce empty runs, and get live milestone approvals."
                icon={Truck}
                features={[
                  'Automated Load Matching & Distance Calc',
                  'AI Samruddhi Corridor Routing',
                  'Digital E-Way Bill & Trip Manifest',
                ]}
                isSelected={selectedRole === 'transporter'}
                onSelect={(r) => setSelectedRole(r)}
              />
            </div>

            {/* Role Confirmation Action */}
            <div className="mt-10 text-center max-w-md mx-auto">
              <Button
                variant="solid-forest"
                size="lg"
                onClick={handleRoleConfirm}
                className="w-full text-base py-3.5 shadow-ambient"
                icon={ArrowRight}
                iconPosition="right"
              >
                Continue to {selectedRole.toUpperCase()} Dashboard
              </Button>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-ink-500 hover:text-forest-700 underline mt-3 block mx-auto"
              >
                ← Back to credentials
              </button>
            </div>
          </div>
        )}
      </div>
    </MarketingShell>
  );
}
