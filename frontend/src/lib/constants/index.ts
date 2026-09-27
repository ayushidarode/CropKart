import { CropCategory, QualityGrade } from '@/types/database';

export const CROP_CATEGORIES: CropCategory[] = [
  'Grain',
  'Vegetable',
  'Fruit',
  'Pulse',
  'Oilseed',
  'Commercial',
  'Spices',
];

export const QUALITY_GRADES: QualityGrade[] = [
  'Grade A',
  'Grade B',
  'Standard',
  'Premium',
];

export const UNITS = ['kg', 'quintal', 'ton', 'box', 'bag'];

export const POPULAR_LOCATIONS = [
  'Pune, Maharashtra',
  'Nashik, Maharashtra',
  'Nagpur, Maharashtra',
  'Mumbai, Maharashtra',
  'Ludhiana, Punjab',
  'Anand, Gujarat',
  'Indore, Madhya Pradesh',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Jaipur, Rajasthan',
];

export const CROP_FALLBACK_IMAGES: Record<string, string> = {
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop',
  soybean: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop',
  cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop',
};

export const CROP_SVG_ICONS: Record<string, string> = {
  grain: '🌾',
  vegetable: '🥬',
  fruit: '🍎',
  pulse: '🫘',
  oilseed: '🌻',
  commercial: '🌱',
  spices: '🌶️',
  wheat: '🌾',
  tomato: '🍅',
  rice: '🍚',
  onion: '🧅',
  potato: '🥔',
  cotton: '☁️',
  maize: '🌽',
  chilli: '🌶️',
};

export function getCropImage(name: string, primaryUrl?: string | null): string {
  if (primaryUrl && primaryUrl.startsWith('http')) {
    return primaryUrl;
  }
  const cleanName = name.toLowerCase();
  for (const [key, url] of Object.entries(CROP_FALLBACK_IMAGES)) {
    if (cleanName.includes(key)) {
      return url;
    }
  }
  return CROP_FALLBACK_IMAGES.default;
}

export function getCropIcon(name: string, category?: string): string {
  const cleanName = name.toLowerCase();
  for (const [key, icon] of Object.entries(CROP_SVG_ICONS)) {
    if (cleanName.includes(key)) {
      return icon;
    }
  }
  if (category) {
    const cat = category.toLowerCase();
    if (CROP_SVG_ICONS[cat]) return CROP_SVG_ICONS[cat];
  }
  return '🌱';
}
