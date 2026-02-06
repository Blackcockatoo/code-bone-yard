export type FormKey = 'radiant' | 'meditation' | 'sage' | 'vigilant' | 'celestial' | 'wild';

export interface GuardianForm {
  name: string;
  baseColor: string;
  primaryGold: string;
  secondaryGold: string;
  tealAccent: string;
  eyeColor: string;
  glowColor: string;
  description: string;
}

export const GUARDIAN_FORMS: Record<FormKey, GuardianForm> = {
  radiant: {
    name: 'Radiant Guardian',
    baseColor: '#2C3E77',
    primaryGold: '#F4B942',
    secondaryGold: '#FFD700',
    tealAccent: '#4ECDC4',
    eyeColor: '#F4B942',
    glowColor: 'rgba(244, 185, 66, 0.3)',
    description: 'Calm strength - balanced blue and gold',
  },
  meditation: {
    name: 'Meditation Cocoon',
    baseColor: '#0d1321',
    primaryGold: '#2DD4BF',
    secondaryGold: '#4ECDC4',
    tealAccent: '#1a4d4d',
    eyeColor: '#2DD4BF',
    glowColor: 'rgba(45, 212, 191, 0.2)',
    description: 'Quiet endurance - dusk-teal respite',
  },
  sage: {
    name: 'Sage Luminary',
    baseColor: '#1a1f3a',
    primaryGold: '#FFD700',
    secondaryGold: '#F4B942',
    tealAccent: '#4ECDC4',
    eyeColor: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    description: 'Luminous focus - hepta-crown activated',
  },
  vigilant: {
    name: 'Vigilant Sentinel',
    baseColor: '#1a1f3a',
    primaryGold: '#FF6B35',
    secondaryGold: '#FF8C42',
    tealAccent: '#4ECDC4',
    eyeColor: '#FF6B35',
    glowColor: 'rgba(255, 107, 53, 0.4)',
    description: 'Focused will - indigo with neon fire',
  },
  celestial: {
    name: 'Celestial Voyager',
    baseColor: '#0A1128',
    primaryGold: '#E0E7FF',
    secondaryGold: '#C4B5FD',
    tealAccent: '#8B5CF6',
    eyeColor: '#E0E7FF',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    description: 'Cosmic transcendence - stardust and void',
  },
  wild: {
    name: 'Wild Verdant',
    baseColor: '#1A4D2E',
    primaryGold: '#7FFF00',
    secondaryGold: '#32CD32',
    tealAccent: '#90EE90',
    eyeColor: '#7FFF00',
    glowColor: 'rgba(127, 255, 0, 0.4)',
    description: 'Primal vitality - fractal growth unleashed',
  },
};

export const DEFAULT_FORM_KEY: FormKey = 'radiant';
