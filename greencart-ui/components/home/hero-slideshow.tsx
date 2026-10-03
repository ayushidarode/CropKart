"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Fresh farm produce and agri inputs in one wide, simple storefront",
    subtitle:
      "Shop fruits, vegetables, seeds, pesticides and fertilisers with a cleaner Krishi Bazaar experience.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80",
    title: "Built for farmers, retailers, families and bulk buyers",
    subtitle:
      "Large banner images, simpler cards and direct actions make browsing easier on desktop and mobile.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
    title: "Light green and white theme with everyday Indian catalog essentials",
    subtitle:
      "From Nashik pyaz and fresh palak to crop care, nursery and fertilizer products.",
  },
];

export function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="overflow-hidden border-y border-brand-100 bg-white">
      <div className="relative h-[420px] sm:h-[560px] xl:h-[680px]">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              activeIndex === index ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/65 via-emerald-950/20 to-transparent" />
          </div>
        ))}

        <div className="absolute left-5 top-5 rounded-xl bg-white/92 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-950 sm:left-8 sm:top-8">
          Featured Banner
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8 xl:p-12">
          <div className="shell px-0 sm:px-0">
          <p className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl xl:text-6xl">
            {slides[activeIndex].title}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-lg">
            {slides[activeIndex].subtitle}
          </p>
          </div>
        </div>

        <div className="absolute right-5 top-5 flex gap-2 sm:right-8 sm:top-8">
          <button
            type="button"
            onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
            className="rounded-xl bg-white/90 p-2 text-emerald-900"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
            className="rounded-xl bg-white/90 p-2 text-emerald-900"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-brand-100 bg-brand-50 px-4 py-3">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2.5 rounded-full transition-all",
              activeIndex === index ? "w-10 bg-brand-700" : "w-2.5 bg-brand-300",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
