
import { Smile, Mic, Crown, Medal } from 'lucide-react';
import React from 'react';

// Enum to define unique badge names
export const enum Badge {
  FirstLogin = 'first_login',
  MarketDialogue = 'market_dialogue',
  PerfectPronunciation = 'perfect_pronunciation',
}

// Interface for badge information
export interface BadgeInfo {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// A record mapping badge names to their detailed information
export const BADGE_DEFINITIONS: Record<Badge, BadgeInfo> = {
  [Badge.FirstLogin]: {
    name: 'تذكرة الدخول الملكية',
    description: 'مُنحت عند دخول المملكة لأول مرة. أهلاً بكِ!',
    icon: Crown,
    color: '#FFD700', // Gold
  },
  [Badge.MarketDialogue]: {
    name: 'خبيرة حوارات السوق',
    description: 'مُنحت لإتقان تحدي الحوار في السوق بنجاح.',
    icon: Smile,
    color: '#34D399', // Emerald
  },
  [Badge.PerfectPronunciation]: {
    name: 'صوت حتشبسوت',
    description: 'مُنحت لتحقيق نطق مثالي في تحدي قوة حتشبسوت.',
    icon: Mic,
    color: '#60A5FA', // Blue
  },
};

/**
 * Retrieves badge information by its name (enum value).
 * @param name The name of the badge (from the Badge enum).
 * @returns The BadgeInfo object or null if not found.
 */
export function getBadgeByName(name: string): BadgeInfo | null {
  return BADGE_DEFINITIONS[name as Badge] || null;
}
