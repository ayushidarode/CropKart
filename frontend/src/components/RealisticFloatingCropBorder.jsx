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
          Entrance: Top (100ms) -> Idle Float (700ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-48 sm:w-64 opacity-85 sm:opacity-90 pointer-events-none animate-crop-entrance-top"
        style={{ animationDelay: '100ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-1"
          style={{ animationDelay: '700ms' }}
        >
          <img
            src={cornWheatImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(180,83,9,0.2)]"
          />
        </div>
      </div>

      {/* ========================================================
          2. TOP-LEFT: LARGE VINE TOMATOES, PURPLE BRINJAL & CHILLIES (§7)
          Entrance: Top-Left (220ms) -> Idle Float (820ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -left-10 sm:-top-12 sm:-left-12 w-36 sm:w-56 opacity-85 sm:opacity-95 pointer-events-none animate-crop-entrance-left"
        style={{ animationDelay: '220ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-2"
          style={{ animationDelay: '820ms' }}
        >
          <img
            src={tomatoBrinjalImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_14px_24px_rgba(220,38,38,0.22)] transform -rotate-12"
          />
        </div>
      </div>

      {/* ========================================================
          3. TOP-RIGHT: SAVOY CABBAGE, CARROTS & RED ONION (§7)
          Entrance: Top-Right (340ms) -> Idle Float (940ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 sm:-top-12 sm:-right-12 w-36 sm:w-56 opacity-85 sm:opacity-95 pointer-events-none animate-crop-entrance-right"
        style={{ animationDelay: '340ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-3"
          style={{ animationDelay: '940ms' }}
        >
          <img
            src={rootVeggiesImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_14px_24px_rgba(234,88,12,0.2)] transform rotate-12 scale-x-[-1]"
          />
        </div>
      </div>

      {/* ========================================================
          4A. LEFT EDGE (DESKTOP/TABLET): LEAFY GREENS, SUGARCANE & CHILLIES (§7)
          Entrance: Left (460ms) -> Idle Float (1060ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-1/2 -translate-y-1/2 -left-14 w-48 opacity-75 pointer-events-none animate-crop-entrance-left"
        style={{ animationDelay: '460ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-1"
          style={{ animationDelay: '1060ms' }}
        >
          <img
            src={leafyGreensImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(34,197,94,0.2)] transform rotate-45"
          />
        </div>
      </div>

      {/* ========================================================
          4B. MOBILE-ONLY SMALL LEFT SIDE CROP (<768px)
          Scale 60%, positioned high at y ~ 56px so it never overlaps language cards
          Entrance: Left (280ms) -> Idle Float (880ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="block md:hidden absolute top-14 -left-6 w-14 opacity-55 pointer-events-none scale-[0.6] origin-left animate-crop-entrance-left"
        style={{ animationDelay: '280ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-1"
          style={{ animationDelay: '880ms' }}
        >
          <img
            src={leafyGreensImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_10px_18px_rgba(34,197,94,0.18)] transform rotate-45"
          />
        </div>
      </div>

      {/* ========================================================
          5A. RIGHT EDGE (DESKTOP/TABLET): HARVEST DETAILS & WHEAT (§7)
          Entrance: Right (580ms) -> Idle Float (1180ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-14 w-48 opacity-75 pointer-events-none animate-crop-entrance-right"
        style={{ animationDelay: '580ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-2"
          style={{ animationDelay: '1180ms' }}
        >
          <img
            src={cornWheatImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_12px_22px_rgba(217,119,6,0.2)] transform -rotate-45"
          />
        </div>
      </div>

      {/* ========================================================
          5B. MOBILE-ONLY SMALL RIGHT SIDE CROP (<768px)
          Scale 60%, positioned high at y ~ 56px so it never overlaps language cards
          Entrance: Right (400ms) -> Idle Float (1000ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="block md:hidden absolute top-14 -right-6 w-14 opacity-55 pointer-events-none scale-[0.6] origin-right animate-crop-entrance-right"
        style={{ animationDelay: '400ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-2"
          style={{ animationDelay: '1000ms' }}
        >
          <img
            src={tomatoBrinjalImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_10px_18px_rgba(220,38,38,0.18)] transform -rotate-45 scale-x-[-1]"
          />
        </div>
      </div>

      {/* ========================================================
          6. BOTTOM-LEFT: CARROTS, POTATO & CABBAGE (§7)
          Entrance: Bottom (700ms) -> Idle Float (1300ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="absolute -bottom-8 -left-8 sm:-bottom-12 sm:-left-10 w-36 sm:w-52 opacity-85 sm:opacity-95 pointer-events-none animate-crop-entrance-bottom"
        style={{ animationDelay: '700ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-3"
          style={{ animationDelay: '1300ms' }}
        >
          <img
            src={rootVeggiesImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_16px_28px_rgba(120,53,15,0.25)] transform rotate-6"
          />
        </div>
      </div>

      {/* ========================================================
          7. BOTTOM-RIGHT: CROPCART DELIVERY TRUCK VISUAL (§9, §10)
          The authentic green CropCart delivery truck with driver
          Entrance: Slide in once from right (500ms) -> Idle Float (1200ms)
          ======================================================== */}
      <div
        aria-hidden="true"
        className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 md:bottom-0 md:right-2 w-32 sm:w-36 md:w-40 lg:w-44 max-w-[20vw] opacity-85 sm:opacity-95 pointer-events-none z-0 animate-truck-entrance"
        style={{ animationDelay: '500ms' }}
      >
        <div
          className="w-full h-full animate-truck-float"
          style={{ animationDelay: '1200ms' }}
        >
          <img
            src={deliveryTruckImg}
            alt="CropKart Delivery Truck"
            className="w-full h-auto object-contain drop-shadow-[0_18px_32px_rgba(40,92,56,0.25)]"
          />
        </div>
      </div>

      {/* Bottom Corner Accent Tomatoes near Truck */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute -bottom-6 right-36 md:right-48 w-24 opacity-60 pointer-events-none z-0 animate-crop-entrance-bottom"
        style={{ animationDelay: '800ms' }}
      >
        <div
          className="w-full h-full animate-crop-breeze-1"
          style={{ animationDelay: '1400ms' }}
        >
          <img
            src={tomatoBrinjalImg}
            alt=""
            className="w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(220,38,38,0.2)] transform -rotate-12 scale-x-[-1]"
          />
        </div>
      </div>
    </div>
  );
}
