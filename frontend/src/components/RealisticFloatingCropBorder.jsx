import React from 'react';
import cornWheatImg from '../assets/generated/crops_corn_wheat.png';
import tomatoBrinjalImg from '../assets/generated/crops_tomato_brinjal.png';
import rootVeggiesImg from '../assets/generated/crops_root_veggies.png';
import leafyGreensImg from '../assets/generated/crops_leafy_greens.png';
import deliveryTruckImg from '../assets/cropcart-delivery-truck.png';

/**
 * RealisticFloatingCropBorder (§6, §7, §8, §9, §10)
 * 
 * Exists ONLY on the Language Selection screen (Screen 2).
 * 
 * Features:
 * - High-resolution realistic Indian agricultural crops:
 *   Wheat, Rice, Corn, Tomato, Carrot, Onion, Potato, Chilli, Brinjal, Cabbage, Sugarcane, Greens.
 * - Exact CropCart delivery truck visual from user reference (§9):
 *   Positioned at edge/corner, integrated with crops, never overlaps central UI.
 * - Breeze-like subtle organic floating keyframe animations (§8).
 * - Guaranteed Safe Area: pointer-events-none, z-0, responsive scaling.
 */
export default function RealisticFloatingCropBorder() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Ambient Warm Golden Sunlight Radial Aura (§11) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-3xl opacity-25 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, #F59E0B 0%, #EA580C 28%, #D97706 60%, transparent 80%)',
        }}
      />

      {/* ========================================================
          1. TOP: GOLDEN CORN, WHEAT & RICE GRAINS (§7)
          ======================================================== */}
      <div
        className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-48 sm:w-64 opacity-85 sm:opacity-90 animate-crop-breeze-1"
        style={{ animationDuration: '6.8s', animationDelay: '0s' }}
      >
        <img
          src={cornWheatImg}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(180,83,9,0.2)]"
        />
      </div>

      {/* ========================================================
          2. TOP-LEFT: LARGE VINE TOMATOES, PURPLE BRINJAL & CHILLIES (§7)
          ======================================================== */}
      <div
        className="absolute -top-10 -left-10 sm:-top-12 sm:-left-12 w-36 sm:w-56 opacity-85 sm:opacity-95 animate-crop-breeze-2"
        style={{ animationDuration: '7.5s', animationDelay: '0.6s' }}
      >
        <img
          src={tomatoBrinjalImg}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[0_14px_24px_rgba(220,38,38,0.22)] transform -rotate-12"
        />
      </div>

      {/* ========================================================
          3. TOP-RIGHT: SAVOY CABBAGE, CARROTS & RED ONION (§7)
          ======================================================== */}
      <div
        className="absolute -top-10 -right-10 sm:-top-12 sm:-right-12 w-36 sm:w-56 opacity-85 sm:opacity-95 animate-crop-breeze-3"
        style={{ animationDuration: '6.4s', animationDelay: '1.2s' }}
      >
        <img
          src={rootVeggiesImg}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[0_14px_24px_rgba(234,88,12,0.2)] transform rotate-12 scale-x-[-1]"
        />
      </div>

      {/* ========================================================
          4. LEFT EDGE: LEAFY GREENS, SUGARCANE & CHILLIES (§7)
          ======================================================== */}
      <div
        className="hidden md:block absolute top-1/2 -translate-y-1/2 -left-14 w-48 opacity-75 animate-crop-breeze-1"
        style={{ animationDuration: '8.2s', animationDelay: '1.6s' }}
      >
        <img
          src={leafyGreensImg}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(34,197,94,0.2)] transform rotate-45"
        />
      </div>

      {/* ========================================================
          5. RIGHT EDGE: HARVEST DETAILS & WHEAT (§7)
          ======================================================== */}
      <div
        className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-14 w-48 opacity-75 animate-crop-breeze-2"
        style={{ animationDuration: '7.6s', animationDelay: '0.8s' }}
      >
        <img
          src={cornWheatImg}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(217,119,6,0.2)] transform -rotate-45"
        />
      </div>

      {/* ========================================================
          6. BOTTOM-LEFT: CARROTS, POTATO & CABBAGE (§7)
          ======================================================== */}
      <div
        className="absolute -bottom-8 -left-8 sm:-bottom-12 sm:-left-10 w-36 sm:w-52 opacity-85 sm:opacity-95 animate-crop-breeze-3"
        style={{ animationDuration: '7.2s', animationDelay: '0.4s' }}
      >
        <img
          src={rootVeggiesImg}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(120,53,15,0.25)] transform rotate-6"
        />
      </div>

      {/* ========================================================
          7. BOTTOM-RIGHT / EDGE: CROPCART DELIVERY TRUCK VISUAL (§9, §10)
          The authentic green CropCart delivery truck with driver
          Positioned as a supporting decorative element at the bottom-right,
          harmonizing with crops and never covering central UI.
          ======================================================== */}
      <div
        aria-hidden="true"
        className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 md:bottom-0 md:right-2 w-32 sm:w-36 md:w-40 lg:w-44 max-w-[20vw] opacity-85 sm:opacity-95 animate-truck-float pointer-events-none z-0"
        style={{ animationDuration: '8.5s', animationDelay: '0.2s' }}
      >
        <img
          src={deliveryTruckImg}
          alt="CropKart Delivery Truck"
          className="w-full h-auto object-contain drop-shadow-[0_18px_32px_rgba(40,92,56,0.25)]"
        />
      </div>

      {/* Bottom Corner Accent Crops around Truck */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute -bottom-6 right-36 md:right-48 w-24 opacity-60 pointer-events-none animate-crop-breeze-1 z-0"
        style={{ animationDuration: '6.6s', animationDelay: '1.4s' }}
      >
        <img
          src={tomatoBrinjalImg}
          alt=""
          className="w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(220,38,38,0.2)] transform -rotate-12 scale-x-[-1]"
        />
      </div>

      {/* Subtle organic breeze & truck keyframe animations (§8) */}
      <style>{`
        @keyframes cropBreeze1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          33% {
            transform: translate3d(4px, -6px, 0) rotate(-1.5deg);
          }
          66% {
            transform: translate3d(-3px, -4px, 0) rotate(1.2deg);
          }
        }
        @keyframes cropBreeze2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          40% {
            transform: translate3d(-4px, -7px, 0) rotate(1.8deg);
          }
          75% {
            transform: translate3d(3px, -3px, 0) rotate(-1deg);
          }
        }
        @keyframes cropBreeze3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(3px, -8px, 0) scale(1.02) rotate(-1.5deg);
          }
        }
        @keyframes truckFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-3px, -5px, 0);
          }
        }
        .animate-crop-breeze-1 {
          animation: cropBreeze1 infinite ease-in-out;
        }
        .animate-crop-breeze-2 {
          animation: cropBreeze2 infinite ease-in-out;
        }
        .animate-crop-breeze-3 {
          animation: cropBreeze3 infinite ease-in-out;
        }
        .animate-truck-float {
          animation: truckFloat infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
