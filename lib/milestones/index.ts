/**
 * Meta-Pet Milestones & Memory Journal System
 *
 * Creates emotional attachment through:
 * - First-time interaction memories
 * - Milestone celebrations (first day, first week, etc.)
 * - Special moments (first evolution, first achievement, etc.)
 * - Care streaks and dedication tracking
 * - Personalized companion memories
 */

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  description: string;
  timestamp: number;
  emoji: string;
  data?: Record<string, unknown>;
}

export type MemoryType =
  | "first_meeting"
  | "first_feed"
  | "first_play"
  | "first_clean"
  | "first_sleep"
  | "first_evolution"
  | "first_achievement"
  | "first_battle_win"
  | "first_minigame"
  | "naming"
  | "one_hour"
  | "one_day"
  | "one_week"
  | "one_month"
  | "care_streak_3"
  | "care_streak_7"
  | "care_streak_30"
  | "max_happiness"
  | "perfect_vitals"
  | "evolution_complete"
  | "custom";

export interface MilestoneProgress {
  memories: Memory[];
  totalInteractions: number;
  totalFeedings: number;
  totalCleanings: number;
  totalPlaySessions: number;
  totalSleeps: number;
  longestCareStreak: number;
  currentCareStreak: number;
  lastInteractionDate: string | null;
  firstMeetingDate: number | null;
  perfectVitalsCount: number;
  maxHappinessCount: number;
}

const MILESTONE_DEFINITIONS: Record<
  MemoryType,
  { title: string; description: string; emoji: string }
> = {
  first_meeting: {
    title: "First Meeting",
    description: "The moment your bond began. A new consciousness awakened.",
    emoji: "🌟",
  },
  first_feed: {
    title: "First Meal Together",
    description: "You provided your companion with its first nourishment.",
    emoji: "🍎",
  },
  first_play: {
    title: "First Playtime",
    description:
      "Joy sparked between you and your companion for the first time.",
    emoji: "✨",
  },
  first_clean: {
    title: "First Grooming",
    description: "You showed care by keeping your companion clean and healthy.",
    emoji: "💧",
  },
  first_sleep: {
    title: "First Rest",
    description: "Your companion trusted you enough to rest peacefully.",
    emoji: "🌙",
  },
  first_evolution: {
    title: "First Evolution",
    description:
      "Your companion transformed, growing stronger through your care.",
    emoji: "🦋",
  },
  first_achievement: {
    title: "First Achievement",
    description: "Together, you accomplished something meaningful.",
    emoji: "🏆",
  },
  first_battle_win: {
    title: "First Victory",
    description: "Your companion proved its strength in its first battle.",
    emoji: "⚔️",
  },
  first_minigame: {
    title: "First Game Together",
    description: "You and your companion shared a moment of fun.",
    emoji: "🎮",
  },
  naming: {
    title: "A Name is Given",
    description: "You gave your companion an identity of its own.",
    emoji: "📝",
  },
  one_hour: {
    title: "One Hour Together",
    description: "Your first hour of companionship.",
    emoji: "⏰",
  },
  one_day: {
    title: "First Day Complete",
    description: "You've cared for your companion for a full day.",
    emoji: "🌅",
  },
  one_week: {
    title: "One Week Bond",
    description: "A week of shared moments and growing connection.",
    emoji: "📅",
  },
  one_month: {
    title: "One Month Anniversary",
    description: "A month of dedication and deepening bond.",
    emoji: "🎂",
  },
  care_streak_3: {
    title: "3-Day Care Streak",
    description: "Three days of consistent, loving care.",
    emoji: "🔥",
  },
  care_streak_7: {
    title: "Weekly Dedication",
    description: "A full week of daily care. Your companion feels loved.",
    emoji: "💪",
  },
  care_streak_30: {
    title: "Monthly Guardian",
    description: "A month of unbroken care. You are a true guardian.",
    emoji: "👑",
  },
  max_happiness: {
    title: "Peak Joy",
    description: "Your companion reached maximum happiness!",
    emoji: "🥰",
  },
  perfect_vitals: {
    title: "Perfect Balance",
    description: "All vitals at optimal levels. Perfect care achieved.",
    emoji: "💯",
  },
  evolution_complete: {
    title: "Final Form",
    description: "Your companion reached its ultimate evolution.",
    emoji: "🌌",
  },
  custom: {
    title: "Special Moment",
    description: "A unique memory to treasure.",
    emoji: "💫",
  },
};

/**
 * Create default milestone progress
 */
export function createDefaultMilestoneProgress(): MilestoneProgress {
  return {
    memories: [],
    totalInteractions: 0,
    totalFeedings: 0,
    totalCleanings: 0,
    totalPlaySessions: 0,
    totalSleeps: 0,
    longestCareStreak: 0,
    currentCareStreak: 0,
    lastInteractionDate: null,
    firstMeetingDate: null,
    perfectVitalsCount: 0,
    maxHappinessCount: 0,
  };
}

/**
 * Check if a memory type already exists
 */
export function hasMemory(
  progress: MilestoneProgress,
  type: MemoryType,
): boolean {
  return progress.memories.some((m) => m.type === type);
}

/**
 * Add a new memory
 */
export function addMemory(
  progress: MilestoneProgress,
  type: MemoryType,
  customData?: {
    title?: string;
    description?: string;
    emoji?: string;
    data?: Record<string, unknown>;
  },
): MilestoneProgress {
  // Don't add duplicate memories (except custom)
  if (type !== "custom" && hasMemory(progress, type)) {
    return progress;
  }

  const definition = MILESTONE_DEFINITIONS[type];
  const memory: Memory = {
    id: `memory-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    title: customData?.title ?? definition.title,
    description: customData?.description ?? definition.description,
    emoji: customData?.emoji ?? definition.emoji,
    timestamp: Date.now(),
    data: customData?.data,
  };

  return {
    ...progress,
    memories: [...progress.memories, memory],
  };
}

/**
 * Record an interaction and check for milestones
 */
export function recordInteraction(
  progress: MilestoneProgress,
  action: "feed" | "clean" | "play" | "sleep",
  vitals?: { hunger: number; hygiene: number; mood: number; energy: number },
): MilestoneProgress {
  let updated = { ...progress };

  // Update counts
  updated.totalInteractions += 1;
  switch (action) {
    case "feed":
      updated.totalFeedings += 1;
      if (!hasMemory(updated, "first_feed")) {
        updated = addMemory(updated, "first_feed");
      }
      break;
    case "clean":
      updated.totalCleanings += 1;
      if (!hasMemory(updated, "first_clean")) {
        updated = addMemory(updated, "first_clean");
      }
      break;
    case "play":
      updated.totalPlaySessions += 1;
      if (!hasMemory(updated, "first_play")) {
        updated = addMemory(updated, "first_play");
      }
      break;
    case "sleep":
      updated.totalSleeps += 1;
      if (!hasMemory(updated, "first_sleep")) {
        updated = addMemory(updated, "first_sleep");
      }
      break;
  }

  // Check care streak
  const today = new Date().toDateString();
  if (updated.lastInteractionDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (updated.lastInteractionDate === yesterday.toDateString()) {
      updated.currentCareStreak += 1;
    } else if (updated.lastInteractionDate !== null) {
      updated.currentCareStreak = 1;
    } else {
      updated.currentCareStreak = 1;
    }

    updated.lastInteractionDate = today;

    // Check streak milestones
    if (
      updated.currentCareStreak >= 3 &&
      !hasMemory(updated, "care_streak_3")
    ) {
      updated = addMemory(updated, "care_streak_3");
    }
    if (
      updated.currentCareStreak >= 7 &&
      !hasMemory(updated, "care_streak_7")
    ) {
      updated = addMemory(updated, "care_streak_7");
    }
    if (
      updated.currentCareStreak >= 30 &&
      !hasMemory(updated, "care_streak_30")
    ) {
      updated = addMemory(updated, "care_streak_30");
    }

    updated.longestCareStreak = Math.max(
      updated.longestCareStreak,
      updated.currentCareStreak,
    );
  }

  // Check vitals milestones
  if (vitals) {
    if (vitals.mood >= 95 && !hasMemory(updated, "max_happiness")) {
      updated.maxHappinessCount += 1;
      if (updated.maxHappinessCount >= 3) {
        updated = addMemory(updated, "max_happiness");
      }
    }

    const allHigh =
      vitals.hunger >= 80 &&
      vitals.hygiene >= 80 &&
      vitals.mood >= 80 &&
      vitals.energy >= 80;
    if (allHigh && !hasMemory(updated, "perfect_vitals")) {
      updated.perfectVitalsCount += 1;
      if (updated.perfectVitalsCount >= 5) {
        updated = addMemory(updated, "perfect_vitals");
      }
    }
  }

  return updated;
}

/**
 * Record first meeting
 */
export function recordFirstMeeting(
  progress: MilestoneProgress,
): MilestoneProgress {
  if (hasMemory(progress, "first_meeting")) {
    return progress;
  }

  let updated = addMemory(progress, "first_meeting");
  updated.firstMeetingDate = Date.now();
  return updated;
}

/**
 * Record naming
 */
export function recordNaming(
  progress: MilestoneProgress,
  name: string,
): MilestoneProgress {
  if (hasMemory(progress, "naming")) {
    return progress;
  }

  return addMemory(progress, "naming", {
    description: `You named your companion "${name}".`,
    data: { name },
  });
}

/**
 * Record evolution
 */
export function recordEvolution(
  progress: MilestoneProgress,
  stage: string,
  isFinal: boolean = false,
): MilestoneProgress {
  let updated = progress;

  if (!hasMemory(updated, "first_evolution")) {
    updated = addMemory(updated, "first_evolution", {
      description: `Your companion evolved to the ${stage} stage.`,
      data: { stage },
    });
  }

  if (isFinal && !hasMemory(updated, "evolution_complete")) {
    updated = addMemory(updated, "evolution_complete", {
      description: "Your companion reached its final form: SPECIATION.",
      data: { stage },
    });
  }

  return updated;
}

/**
 * Record achievement
 */
export function recordAchievementMilestone(
  progress: MilestoneProgress,
  achievementName: string,
): MilestoneProgress {
  if (!hasMemory(progress, "first_achievement")) {
    return addMemory(progress, "first_achievement", {
      description: `You earned the "${achievementName}" achievement.`,
      data: { achievementName },
    });
  }
  return progress;
}

/**
 * Record battle win
 */
export function recordBattleWin(
  progress: MilestoneProgress,
  opponent: string,
): MilestoneProgress {
  if (!hasMemory(progress, "first_battle_win")) {
    return addMemory(progress, "first_battle_win", {
      description: `Your companion defeated ${opponent} in battle.`,
      data: { opponent },
    });
  }
  return progress;
}

/**
 * Record minigame play
 */
export function recordMinigame(
  progress: MilestoneProgress,
  game: string,
): MilestoneProgress {
  if (!hasMemory(progress, "first_minigame")) {
    return addMemory(progress, "first_minigame", {
      description: `You played ${game} with your companion.`,
      data: { game },
    });
  }
  return progress;
}

/**
 * Check time-based milestones
 */
export function checkTimeMilestones(
  progress: MilestoneProgress,
): MilestoneProgress {
  if (!progress.firstMeetingDate) {
    return progress;
  }

  const now = Date.now();
  const elapsed = now - progress.firstMeetingDate;
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;
  const ONE_WEEK = 7 * ONE_DAY;
  const ONE_MONTH = 30 * ONE_DAY;

  let updated = progress;

  if (elapsed >= ONE_HOUR && !hasMemory(updated, "one_hour")) {
    updated = addMemory(updated, "one_hour");
  }
  if (elapsed >= ONE_DAY && !hasMemory(updated, "one_day")) {
    updated = addMemory(updated, "one_day");
  }
  if (elapsed >= ONE_WEEK && !hasMemory(updated, "one_week")) {
    updated = addMemory(updated, "one_week");
  }
  if (elapsed >= ONE_MONTH && !hasMemory(updated, "one_month")) {
    updated = addMemory(updated, "one_month");
  }

  return updated;
}

/**
 * Get memories sorted by timestamp (newest first)
 */
export function getMemoriesSorted(progress: MilestoneProgress): Memory[] {
  return [...progress.memories].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get milestone stats for display
 */
export function getMilestoneStats(progress: MilestoneProgress) {
  const totalPossible = Object.keys(MILESTONE_DEFINITIONS).length - 1; // Exclude 'custom'
  const uniqueTypes = new Set(
    progress.memories.filter((m) => m.type !== "custom").map((m) => m.type),
  );

  return {
    memoriesCount: progress.memories.length,
    uniqueMilestones: uniqueTypes.size,
    totalPossibleMilestones: totalPossible,
    completionPercentage: Math.round((uniqueTypes.size / totalPossible) * 100),
    daysSinceFirstMeeting: progress.firstMeetingDate
      ? Math.floor(
          (Date.now() - progress.firstMeetingDate) / (24 * 60 * 60 * 1000),
        )
      : 0,
    currentStreak: progress.currentCareStreak,
    longestStreak: progress.longestCareStreak,
  };
}
