import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import cropcartLogo from '../assets/cropcart-logo.png';
import RealisticFloatingCropBorder from '../components/RealisticFloatingCropBorder';

// The 12 commonly used Indian languages per specification §13
const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिंदी', english: 'Hindi' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'or', native: 'ଓଡ଼ିଆ', english: 'Odia' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
];

export default function LanguageSelectionPage({ onContinueCustom }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLanguage: setAppContextLanguage } = useApp();

  // Selected language state
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for previously saved language on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cropcart_language') || localStorage.getItem('cropkart_language');
      if (stored) {
        const match = LANGUAGES.find(
          (lang) => lang.code.toLowerCase() === stored.toLowerCase() || lang.english.toLowerCase() === stored.toLowerCase()
        );
        if (match) {
          setSelectedLanguage(match.code);
        }
      }
    } catch (e) {
      // Graceful fallback if storage unavailable
    }
  }, []);

  const handleSelect = (code) => {
    setSelectedLanguage(code);
  };

  const handleKeyDown = (e, code) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(code);
    }
  };

  const handleContinue = () => {
    if (!selectedLanguage) return;

    setIsSubmitting(true);

    try {
      // Save selected language to storage (§17)
      localStorage.setItem('cropcart_language', selectedLanguage);
      localStorage.setItem('cropkart_language', selectedLanguage);

      if (typeof setAppContextLanguage === 'function') {
        const codeMap = {
          en: 'EN',
          hi: 'हिं',
          mr: 'मर',
        };
        setAppContextLanguage(codeMap[selectedLanguage] || selectedLanguage.toUpperCase());
      }
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }

    if (typeof onContinueCustom === 'function') {
      onContinueCustom(selectedLanguage);
      return;
    }

    // Continue to application's existing next screen/flow (Account Type Selection)
    const destination = location.state?.from || '/account-type';
    setTimeout(() => {
      navigate(destination);
    }, 150);
  };

  return (
    <div
      className="min-h-screen text-amber-950 flex flex-col justify-between relative overflow-x-hidden selection:bg-amber-200 selection:text-amber-900 font-sans"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #FFFDF9 0%, #FAF4E8 50%, #F5EADB 100%)',
      }}
    >
      {/* ========================================================
          1. REALISTIC FLOATING CROP BORDER (§9, §10, §11)
          Outer edge framing with realistic wheat, corn, rice,
          tomatoes, brinjal, carrots, cabbage, and chillies
          ======================================================== */}
      <RealisticFloatingCropBorder />

      {/* Ambient background warm glow */}
      <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(234, 88, 12, 0.2) 50%, transparent 75%)',
          }}
        />
      </div>

      {/* ========================================================
          MAIN CONTENT CONTAINER (Centered, Mobile-First, Safe Area)
          ======================================================== */}
      <main className="w-full max-w-lg mx-auto px-2.5 sm:px-6 pt-3 sm:pt-6 pb-6 md:pb-8 flex-1 flex flex-col items-center justify-start gap-2 sm:gap-3.5 relative z-10">
        
        {/* Top Section: Logo + Headings (§8) */}
        <div className="w-full flex flex-col items-center text-center">
          {/* Top: Existing CropCart Logo */}
          <div className="animate-fade-in-up">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-xl flex items-center justify-center transition-transform hover:scale-105 duration-300 border border-amber-200/80"
              style={{
                boxShadow: '0 12px 28px -6px rgba(180, 83, 9, 0.22), 0 0 20px rgba(245, 158, 11, 0.15)',
              }}
            >
              <img
                src={cropcartLogo}
                alt="CropCart"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Heading (§8) */}
          <div className="mt-2.5 sm:mt-3 animate-fade-in-up delay-100">
            <h1 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-amber-950 tracking-tight leading-tight px-2 break-words">
              Choose Your Language
            </h1>

            {/* Supporting Text (§8) */}
            <p className="mt-1 sm:mt-1.5 text-amber-800/80 text-xs sm:text-sm font-semibold">
              Select your preferred language to continue
            </p>
          </div>
        </div>

        {/* ========================================================
            2. THE 12 LANGUAGES GRID (§13, §14)
            Mobile-First Compact 2-Column Grid
            Large touch targets, comfortable vertical scrolling if needed
            ======================================================== */}
        <section
          aria-label="Language selection options"
          role="radiogroup"
          className="w-full mt-2 sm:mt-2.5 grid grid-cols-2 gap-2 sm:gap-3 max-h-[46vh] sm:max-h-[50vh] md:max-h-[32vh] lg:max-h-[38vh] overflow-y-auto px-1.5 py-1.5 custom-scrollbar animate-fade-in-up delay-200"
        >
          {LANGUAGES.map((lang, index) => {
            const isSelected = selectedLanguage === lang.code;

            return (
              <button
                key={lang.code}
                id={`lang-card-${lang.code}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${lang.native} (${lang.english})`}
                tabIndex={0}
                onClick={() => handleSelect(lang.code)}
                onKeyDown={(e) => handleKeyDown(e, lang.code)}
                style={{ animationDelay: `${index * 25}ms` }}
                className={`
                  relative text-left p-2.5 sm:p-3.5 rounded-2xl transition-all duration-200 ease-out outline-none select-none min-h-[60px] sm:min-h-[64px] min-w-0 flex items-center justify-between gap-1.5 sm:gap-2
                  focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2
                  ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 text-white shadow-xl border-2 border-amber-500 scale-[1.02] ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-50'
                      : 'bg-white/90 backdrop-blur-sm hover:bg-white text-amber-950 border border-amber-200/90 hover:border-amber-400/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                  }
                `}
              >
                {/* Language Labels */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`
                      block font-bold text-sm sm:text-base md:text-lg tracking-tight leading-none truncate
                      ${isSelected ? 'text-white' : 'text-amber-950'}
                    `}
                  >
                    {lang.native}
                  </span>
                  <span
                    className={`
                      block text-[11px] sm:text-xs font-medium mt-1 truncate
                      ${isSelected ? 'text-amber-200' : 'text-amber-700/80'}
                    `}
                  >
                    {lang.english}
                  </span>
                </div>

                {/* Selection Indicator (§14) */}
                <div className="shrink-0">
                  {isSelected ? (
                    <span
                      className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-md animate-scale-check"
                      aria-hidden="true"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full border-2 border-amber-300/80 group-hover:border-amber-500 transition-colors block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </section>

        {/* ========================================================
            3. CONTINUE BUTTON (§15)
            Warm Orange + Golden Yellow + Green Accent
            ======================================================== */}
        <div className="w-full mt-4 sm:mt-5 animate-fade-in-up delay-300">
          <button
            id="continue-language-button"
            type="button"
            disabled={!selectedLanguage || isSubmitting}
            onClick={handleContinue}
            aria-disabled={!selectedLanguage || isSubmitting}
            className={`
              w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-base sm:text-lg
              flex items-center justify-center gap-2.5 transition-all duration-200 ease-out select-none min-h-[50px]
              focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2
              ${
                selectedLanguage && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-yellow-300/50'
                  : 'bg-amber-200/50 text-amber-500/60 cursor-not-allowed opacity-60 pointer-events-none border border-amber-200/40'
              }
            `}
          >
            <span>{isSubmitting ? 'Loading...' : 'Continue'}</span>
            <ArrowRight
              className={`w-5 h-5 transition-transform ${
                selectedLanguage && !isSubmitting ? 'group-hover:translate-x-1 text-yellow-200' : ''
              }`}
            />
          </button>

          {/* Feedback Label */}
          <div className="h-5 mt-1.5 flex items-center justify-center text-center">
            {selectedLanguage ? (
              <span className="text-[11px] sm:text-xs text-amber-900 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Selected:{' '}
                <strong className="text-amber-950 font-bold">
                  {LANGUAGES.find((l) => l.code === selectedLanguage)?.native} (
                  {LANGUAGES.find((l) => l.code === selectedLanguage)?.english})
                </strong>
              </span>
            ) : (
              <span className="text-[11px] text-amber-700/60">Please choose a language to proceed</span>
            )}
          </div>
        </div>
      </main>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes scaleCheck {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }
          70% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-scale-check {
          animation: scaleCheck 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .delay-100 {
          animation-delay: 80ms;
        }
        .delay-200 {
          animation-delay: 150ms;
        }
        .delay-300 {
          animation-delay: 240ms;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(180, 83, 9, 0.25);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}
