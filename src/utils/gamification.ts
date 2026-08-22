// Gamification Engine: XP, Tier Colors, Streaks, and Prestige System (§1.3, §2.1, §2.4, §2.5 of Design.md v3.0)

export interface LevelInfo {
  level: number;
  title: string;
  badge: string;
  darkColor: string;
  lightColor: string;
  badgeBgDark: string;
  badgeBgLight: string;
  currentXp: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  progressPct: number;
  tierGradientDark: string;
  tierGradientLight: string;
}

export function calculatePlayerXp(
  bankedProfit: number,
  contractsWon: number,
  disciplineWalkaways: number,
  reputation: number
): number {
  // XP Calculation Formula (§2.1):
  // Profit: 1 XP per $200 banked profit
  // Contracts: 500 XP per contract won
  // Discipline: 250 XP per disciplined walkaway
  // Reputation: 10 XP per reputation point
  const profitXp = Math.max(0, Math.round(bankedProfit / 200));
  const contractXp = contractsWon * 500;
  const disciplineXp = disciplineWalkaways * 250;
  const reputationXp = Math.round(reputation * 10);

  return profitXp + contractXp + disciplineXp + reputationXp;
}

export const TIER_CONFIGS = [
  {
    level: 1,
    title: 'Junior Procurement Analyst',
    badge: '🥉',
    minXp: 0,
    maxXp: 1000,
    darkColor: 'text-orange-400',
    lightColor: 'text-orange-700',
    badgeBgDark: 'bg-orange-950/50 text-orange-400 border-orange-800',
    badgeBgLight: 'bg-orange-50 text-orange-700 border-orange-300',
    tierGradientDark: 'from-orange-500 to-slate-400',
    tierGradientLight: 'from-orange-600 to-slate-500',
  },
  {
    level: 2,
    title: 'Strategic Sourcing Specialist',
    badge: '🥈',
    minXp: 1000,
    maxXp: 3000,
    darkColor: 'text-slate-300',
    lightColor: 'text-slate-600',
    badgeBgDark: 'bg-slate-800 text-slate-300 border-slate-600',
    badgeBgLight: 'bg-slate-100 text-slate-600 border-slate-400',
    tierGradientDark: 'from-slate-400 to-yellow-400',
    tierGradientLight: 'from-slate-500 to-yellow-600',
  },
  {
    level: 3,
    title: 'Senior Commercial Strategist',
    badge: '🥇',
    minXp: 3000,
    maxXp: 7000,
    darkColor: 'text-yellow-400',
    lightColor: 'text-yellow-700',
    badgeBgDark: 'bg-yellow-950/50 text-yellow-400 border-yellow-800',
    badgeBgLight: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    tierGradientDark: 'from-yellow-400 to-sky-400',
    tierGradientLight: 'from-yellow-600 to-sky-600',
  },
  {
    level: 4,
    title: 'VP of Supply Chain & Bidding',
    badge: '💎',
    minXp: 7000,
    maxXp: 15000,
    darkColor: 'text-sky-400',
    lightColor: 'text-sky-700',
    badgeBgDark: 'bg-sky-950/50 text-sky-400 border-sky-800',
    badgeBgLight: 'bg-sky-50 text-sky-700 border-sky-300',
    tierGradientDark: 'from-sky-400 to-purple-400',
    tierGradientLight: 'from-sky-600 to-purple-600',
  },
  {
    level: 5,
    title: 'Chief Commercial Tycoon',
    badge: '👑',
    minXp: 15000,
    maxXp: 30000,
    darkColor: 'text-purple-400',
    lightColor: 'text-purple-700',
    badgeBgDark: 'bg-purple-950/50 text-purple-400 border-purple-800',
    badgeBgLight: 'bg-purple-50 text-purple-700 border-purple-300',
    tierGradientDark: 'from-purple-500 to-amber-300',
    tierGradientLight: 'from-purple-600 to-amber-500',
  },
];

export function getPlayerLevelInfo(totalXp: number): LevelInfo {
  for (let i = 0; i < TIER_CONFIGS.length; i++) {
    const lvl = TIER_CONFIGS[i];
    if (totalXp < lvl.maxXp || i === TIER_CONFIGS.length - 1) {
      const range = lvl.maxXp - lvl.minXp;
      const progress = Math.min(100, Math.max(0, Math.round(((totalXp - lvl.minXp) / range) * 100)));
      return {
        level: lvl.level,
        title: lvl.title,
        badge: lvl.badge,
        darkColor: lvl.darkColor,
        lightColor: lvl.lightColor,
        badgeBgDark: lvl.badgeBgDark,
        badgeBgLight: lvl.badgeBgLight,
        currentXp: totalXp,
        currentLevelBaseXp: lvl.minXp,
        nextLevelXp: lvl.maxXp,
        progressPct: progress,
        tierGradientDark: lvl.tierGradientDark,
        tierGradientLight: lvl.tierGradientLight
      };
    }
  }

  const maxTier = TIER_CONFIGS[4];
  return {
    level: 5,
    title: maxTier.title,
    badge: maxTier.badge,
    darkColor: maxTier.darkColor,
    lightColor: maxTier.lightColor,
    badgeBgDark: maxTier.badgeBgDark,
    badgeBgLight: maxTier.badgeBgLight,
    currentXp: totalXp,
    currentLevelBaseXp: 15000,
    nextLevelXp: 30000,
    progressPct: 100,
    tierGradientDark: maxTier.tierGradientDark,
    tierGradientLight: maxTier.tierGradientLight
  };
}

// Format Accents (§1.4)
export const AUCTION_FORMAT_ACCENTS = {
  english: {
    name: 'Reverse English',
    icon: '🔨',
    darkAccent: '#FB923C', // orange-400
    lightAccent: '#C2410C', // orange-700
    cardTopBorder: 'border-t-4 border-t-orange-500',
    headerTint: 'bg-orange-500/10 border-orange-500/30',
    badgeDark: 'bg-orange-950/60 text-orange-400 border-orange-800',
    badgeLight: 'bg-orange-50 text-orange-700 border-orange-300'
  },
  dutch: {
    name: 'Reverse Dutch',
    icon: '⏳',
    darkAccent: '#2DD4BF', // teal-400
    lightAccent: '#0F766E', // teal-700
    cardTopBorder: 'border-t-4 border-t-teal-400',
    headerTint: 'bg-teal-500/10 border-teal-500/30',
    badgeDark: 'bg-teal-950/60 text-teal-300 border-teal-800',
    badgeLight: 'bg-teal-50 text-teal-700 border-teal-300'
  },
  japanese: {
    name: 'Japanese Clock',
    icon: '🇯🇵',
    darkAccent: '#A78BFA', // violet-400
    lightAccent: '#6D28D9', // violet-700
    cardTopBorder: 'border-t-4 border-t-violet-400',
    headerTint: 'bg-violet-500/10 border-violet-500/30',
    badgeDark: 'bg-violet-950/60 text-violet-300 border-violet-800',
    badgeLight: 'bg-violet-50 text-violet-700 border-violet-300'
  }
};
