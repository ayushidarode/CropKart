import React, { useState, useEffect, useRef } from 'react';
import cropcartLogo from '../assets/cropcart-logo.png';

/**
 * CropCartLogoIntro (Screen 1)
 * 
 * Recreates the CropKart logo intro transition shown in the storyboard reference:
 * 
 * Timeline:
 *  0.0s – 0.15s: Clean warm agricultural background, center mostly empty
 *  0.15s – 0.4s: Agricultural green field/landscape elements smoothly enter from BOTH LEFT and RIGHT sides inward
 *  0.4s – 1.0s: Farmer (hat, clothes, phone) + Sun + Crop-loaded Cart enter smoothly from above/side
 *  1.0s – 1.3s: CropKart cart & crops settle into center; Wordmark smoothly slides upward from below
 *  1.3s – 1.8s: Complete authoritative CropKart logo is fully assembled
 *  1.8s – 2.2s: Brief logo hold in crisp, pristine focus
 *  2.2s – 2.8s: Smooth fade/morph transition to existing next screen (Language Selection Page)
 * 
 * User Experience:
 *  - Tap anywhere, or press Enter/Space/Escape to skip directly to Language Selection.
 *  - Guarded with useRef flag to ensure onComplete fires exactly once.
 */
export default function CropCartLogoIntro({ onComplete }) {
  const [phase, setPhase] = useState('initial'); // 'initial' | 'landscapes' | 'assembling' | 'assembled' | 'holding' | 'transitioning'
  const hasCompletedRef = useRef(false);

  const triggerComplete = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      triggerComplete();
    }
  };

  useEffect(() => {
    // 0.15s: Side landscapes enter
    const tLandscapes = setTimeout(() => setPhase('landscapes'), 150);
    // 0.4s: Farmer + Cart + Crops enter
    const tAssembling = setTimeout(() => setPhase('assembling'), 400);
    // 1.3s: Complete Logo assembled & locked
    const tAssembled = setTimeout(() => setPhase('assembled'), 1300);
    // 1.8s: Logo hold
    const tHolding = setTimeout(() => setPhase('holding'), 1800);
    // 2.2s: Smooth transition starts
    const tTransition = setTimeout(() => setPhase('transitioning'), 2200);
    // 2.8s: Complete and handoff
    const tComplete = setTimeout(() => {
      triggerComplete();
    }, 2800);
    // 4.0s: Hard safety fallback timeout so splash never hangs
    const tFallback = setTimeout(() => {
      triggerComplete();
    }, 4000);

    return () => {
      clearTimeout(tLandscapes);
      clearTimeout(tAssembling);
      clearTimeout(tAssembled);
      clearTimeout(tHolding);
      clearTimeout(tTransition);
      clearTimeout(tComplete);
      clearTimeout(tFallback);
    };
  }, [onComplete]);

  const isTransitioning = phase === 'transitioning';
  const isAssembled = phase === 'assembled' || phase === 'holding' || phase === 'transitioning';

  return (
    <div
      role="dialog"
      aria-label="CropKart Storyboard Logo Intro"
      tabIndex={0}
      onClick={triggerComplete}
      onKeyDown={handleKeyDown}
      title="Tap anywhere or press Enter/Space/Escape to skip"
      className={`fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden cursor-pointer outline-none transition-all duration-600 ease-out ${
        isTransitioning ? 'opacity-0 scale-[0.95] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #FCFAF4 0%, #F6F1E3 45%, #EFE7D2 80%, #E6DBC0 100%)',
      }}
    >
      {/* ========================================================
          1. WARM AGRICULTURAL AMBIENT GLOW (0.0s)
          Clean warm background, central open horizon
          ======================================================== */}
      <div className="absolute inset-0 pointer-events-none -z-10" aria-hidden="true">
        {/* Soft Golden Sunlight Aura */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-1000 ease-out ${
            phase === 'initial'
              ? 'w-48 h-48 opacity-25 scale-75'
              : 'w-[450px] h-[450px] sm:w-[560px] sm:h-[560px] opacity-45 scale-100'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(246, 200, 82, 0.5) 0%, rgba(212, 232, 90, 0.25) 45%, rgba(40, 92, 56, 0.1) 75%, transparent 88%)',
          }}
        />
      </div>

      {/* ========================================================
          2. SIDE LANDSCAPES ENTERING (0.2s – 0.5s) (Storyboard Panel 2)
          Agricultural green fields enter smoothly from LEFT and RIGHT
          ======================================================== */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden" aria-hidden="true">
        {/* Left Side Landscape Inward Glide */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-start anim-bg-left-field"
          style={{
            transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s ease-out',
          }}
        >
          <svg
            viewBox="0 0 600 800"
            preserveAspectRatio="none"
            className="w-full h-full opacity-[0.14] text-forest-800"
          >
            <path d="M 0 520 L 520 620 L 0 800 Z" fill="currentColor" />
            <path d="M 0 460 L 520 620 L 0 520 Z" fill="currentColor" opacity="0.6" />
            <path d="M 0 400 L 520 620 L 0 460 Z" fill="currentColor" opacity="0.35" />
            <line x1="0" y1="400" x2="520" y2="620" stroke="#86BA44" strokeWidth="2.5" />
            <line x1="0" y1="460" x2="520" y2="620" stroke="#86BA44" strokeWidth="2" />
            <line x1="0" y1="520" x2="520" y2="620" stroke="#86BA44" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Right Side Landscape Inward Glide */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end anim-bg-right-field"
          style={{
            transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s ease-out',
          }}
        >
          <svg
            viewBox="0 0 600 800"
            preserveAspectRatio="none"
            className="w-full h-full opacity-[0.14] text-forest-800 transform scale-x-[-1]"
          >
            <path d="M 0 520 L 520 620 L 0 800 Z" fill="currentColor" />
            <path d="M 0 460 L 520 620 L 0 520 Z" fill="currentColor" opacity="0.6" />
            <path d="M 0 400 L 520 620 L 0 460 Z" fill="currentColor" opacity="0.35" />
            <line x1="0" y1="400" x2="520" y2="620" stroke="#86BA44" strokeWidth="2.5" />
            <line x1="0" y1="460" x2="520" y2="620" stroke="#86BA44" strokeWidth="2" />
            <line x1="0" y1="520" x2="520" y2="620" stroke="#86BA44" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* ========================================================
          3. MASTER LOGO ASSEMBLY CONTAINER (Storyboard Panels 3, 4, 5, 6)
          - Left & Right Farms travel inward (0.2s - 0.6s)
          - Farmer (hat, clothes, phone) enters from upper-left (0.5s - 1.1s)
          - Sun enters from upper-right (0.55s - 1.15s)
          - Cart & Crops enter from above (0.6s - 1.2s)
          - Typography enters upward from below (1.0s - 1.5s)
          - Assembled & Locked (1.5s - 2.1s)
          - Logo Hold (2.1s - 2.5s)
          - Smooth Transition (2.5s - 3.2s)
          ======================================================== */}
      <div className="relative flex flex-col items-center justify-center p-4 max-w-sm sm:max-w-md w-full">
        
        {/* Soft Golden Backing Glow behind assembled card */}
        <div
          className={`absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full blur-2xl transition-all duration-800 ${
            isAssembled ? 'opacity-40 scale-105' : 'opacity-15 scale-90'
          }`}
          style={{
            background: 'radial-gradient(circle, #F6C852 0%, #D4E85A 45%, transparent 75%)',
          }}
        />

        {/* Master Squircle Card Container */}
        <div
          className={`relative z-10 w-48 h-48 sm:w-60 sm:h-60 aspect-square rounded-[36px] bg-white p-3 shadow-2xl transition-all duration-800 ${
            phase === 'initial'
              ? 'opacity-0 scale-90'
              : isTransitioning
              ? 'opacity-95 scale-[0.95] translate-y-0'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow:
              '0 24px 50px -10px rgba(40, 92, 56, 0.22), 0 0 36px rgba(246, 200, 82, 0.25)',
          }}
        >
          {/* SVG Composition using Authoritative Logo Artwork */}
          <svg
            viewBox="0 0 512 512"
            className="w-full h-full overflow-hidden rounded-[26px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Card Container Squircle */}
              <clipPath id="intro-clip-squircle">
                <rect x="0" y="0" width="512" height="512" rx="36" ry="36" />
              </clipPath>

              {/* Storyboard Clip Paths */}
              {/* Left Farm (0.2s - 0.6s) */}
              <clipPath id="sb-clip-left-farm">
                <path d="M 0 145 C 65 160, 130 185, 210 235 L 210 405 L 0 405 Z" />
              </clipPath>

              {/* Right Farm (0.2s - 0.6s) */}
              <clipPath id="sb-clip-right-farm">
                <path d="M 310 235 C 385 185, 450 160, 512 145 L 512 405 L 310 405 Z" />
              </clipPath>

              {/* Sun (0.55s - 1.15s) */}
              <clipPath id="sb-clip-sun">
                <circle cx="366" cy="128" r="76" />
              </clipPath>

              {/* Farmer (hat, clothes, phone) (0.5s - 1.1s) */}
              <clipPath id="sb-clip-farmer">
                <path d="M 75 120 C 95 80, 125 35, 196 35 C 255 35, 275 75, 292 105 C 298 135, 290 180, 260 218 L 75 218 Z" />
              </clipPath>

              {/* Cart (0.6s - 1.2s) */}
              <clipPath id="sb-clip-cart">
                <path d="M 112 195 L 368 195 L 368 368 L 112 368 Z" />
              </clipPath>

              {/* Crops (0.65s - 1.25s) */}
              <clipPath id="sb-clip-crops">
                <path d="M 170 125 C 220 112, 330 112, 396 135 C 402 185, 350 250, 170 250 Z" />
              </clipPath>

              {/* Leaf Curve Swoosh (0.9s - 1.3s) */}
              <clipPath id="sb-clip-leaf-curve">
                <path d="M 140 310 C 200 350, 310 350, 370 310 L 370 350 L 140 350 Z" />
              </clipPath>

              {/* Typography Wordmark (1.0s - 1.5s) */}
              <clipPath id="sb-clip-typography">
                <path d="M 35 348 L 477 348 L 477 500 C 477 500, 450 502, 442 502 L 70 502 C 36 502, 12 478, 12 444 L 12 348 Z" />
              </clipPath>
            </defs>

            {/* Assembling Layers (Active during 0.2s - 1.5s) */}
            {!isAssembled && (
              <g className="anim-storyboard-assembly">
                {/* 1. Left Farm (0.2s – 0.6s) */}
                <g className="anim-sb-left-farm">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-left-farm)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* 2. Right Farm (0.2s – 0.6s) */}
                <g className="anim-sb-right-farm">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-right-farm)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* 3. Sun (0.55s – 1.15s) */}
                <g className="anim-sb-sun">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-sun)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* 4. Farmer (0.5s – 1.1s) */}
                <g className="anim-sb-farmer">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-farmer)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* 5. Cart (0.6s – 1.2s) */}
                <g className="anim-sb-cart">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-cart)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* 6. Crops (0.65s – 1.25s) */}
                <g className="anim-sb-crops">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-crops)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* 7. Leaf Curve Swoosh (0.9s – 1.3s) */}
                <g className="anim-sb-leaf-curve">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-leaf-curve)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>

                {/* 8. Typography Wordmark (1.0s – 1.5s) */}
                <g className="anim-sb-typography">
                  <image
                    href={cropcartLogo}
                    x="0"
                    y="0"
                    width="512"
                    height="512"
                    clipPath="url(#sb-clip-typography)"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              </g>
            )}

            {/* Complete Authoritative Logo (Locked at 1.5s+ with ZERO seams) */}
            <image
              href={cropcartLogo}
              x="0"
              y="0"
              width="512"
              height="512"
              preserveAspectRatio="xMidYMid meet"
              className={`transition-opacity duration-500 ease-out ${
                isAssembled ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </svg>

          {/* Polished light sweep across card upon assembly (1.7s – 2.1s) */}
          <div
            className={`absolute inset-0 rounded-[26px] pointer-events-none transition-opacity duration-600 ${
              phase === 'assembled' ? 'opacity-35' : 'opacity-0'
            }`}
            style={{
              background:
                'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.75) 50%, transparent 65%)',
            }}
          />
        </div>

        {/* Clean Subtitle / Tagline below Logo */}
        <div
          className={`mt-4 sm:mt-5 text-center transition-all duration-700 ${
            isAssembled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-forest-800">
            Smart Agri B2B Marketplace
          </span>
        </div>

        {/* Subtle Tap to Skip Helper */}
        <div className="mt-3 text-center">
          <span className="text-[11px] font-semibold text-forest-700/60 uppercase tracking-wider">
            Tap anywhere to skip
          </span>
        </div>
      </div>

      {/* GPU Keyframe Animations matching Storyboard Timing */}
      <style>{`
        /* Background side landscapes glide inward (0.2s - 0.7s) */
        @keyframes bgLeftFieldTravel {
          0% {
            opacity: 0;
            transform: translate3d(-100%, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes bgRightFieldTravel {
          0% {
            opacity: 0;
            transform: translate3d(100%, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .anim-bg-left-field {
          animation: bgLeftFieldTravel 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .anim-bg-right-field {
          animation: bgRightFieldTravel 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        /* SVG Logo Sub-layers Keyframes */
        /* Left Farm: 0.2s - 0.6s */
        @keyframes sbLeftFarm {
          0% {
            opacity: 0;
            transform: translate3d(-180px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        /* Right Farm: 0.2s - 0.6s */
        @keyframes sbRightFarm {
          0% {
            opacity: 0;
            transform: translate3d(180px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        /* Farmer: 0.5s - 1.1s */
        @keyframes sbFarmer {
          0% {
            opacity: 0;
            transform: translate3d(-15px, -120px, 0) scale(0.9);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, 4px, 0) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        /* Sun: 0.55s - 1.15s */
        @keyframes sbSun {
          0% {
            opacity: 0;
            transform: translate3d(0, -90px, 0) scale(0.7);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, 3px, 0) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        /* Cart: 0.6s - 1.2s */
        @keyframes sbCart {
          0% {
            opacity: 0;
            transform: translate3d(0, -90px, 0) scale(0.92);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, 4px, 0) scale(1.015);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        /* Crops: 0.65s - 1.25s */
        @keyframes sbCrops {
          0% {
            opacity: 0;
            transform: translate3d(0, -80px, 0) scale(0.9);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, 3px, 0) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        /* Leaf Curve Swoosh: 0.9s - 1.3s */
        @keyframes sbLeafCurve {
          0% {
            opacity: 0;
            transform: translate3d(0, 40px, 0) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        /* Typography Wordmark: 1.0s - 1.5s */
        @keyframes sbTypography {
          0% {
            opacity: 0;
            transform: translate3d(0, 75px, 0);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, -3px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .anim-sb-left-farm {
          animation: sbLeftFarm 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .anim-sb-right-farm {
          animation: sbRightFarm 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .anim-sb-farmer {
          animation: sbFarmer 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
        }
        .anim-sb-sun {
          animation: sbSun 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both;
        }
        .anim-sb-cart {
          animation: sbCart 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }
        .anim-sb-crops {
          animation: sbCrops 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
        }
        .anim-sb-leaf-curve {
          animation: sbLeafCurve 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both;
        }
        .anim-sb-typography {
          animation: sbTypography 0.55s cubic-bezier(0.16, 1, 0.3, 1) 1.0s both;
        }
      `}</style>
    </div>
  );
}
