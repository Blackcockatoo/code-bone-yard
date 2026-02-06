"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import {
  loadAudioSettings,
  updateAudioSettings,
  getAudioSettings,
  playButtonClick,
  playFeed,
  playClean,
  playPlay,
  playSleep,
  playAchievement,
  playEvolution,
  playMilestone,
  playSuccess,
  playHeptaCode,
  startAmbientMusic,
  stopAmbientMusic,
  updateAmbientMood,
  cleanup,
  type AudioSettings,
  type Mood,
} from "@/lib/audio";

export interface UseAudioReturn {
  settings: AudioSettings;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  sounds: {
    click: () => Promise<void>;
    feed: () => Promise<void>;
    clean: () => Promise<void>;
    play: () => Promise<void>;
    sleep: () => Promise<void>;
    achievement: () => Promise<void>;
    evolution: () => Promise<void>;
    milestone: () => Promise<void>;
    success: () => Promise<void>;
    heptaCode: (digits: readonly number[]) => Promise<void>;
  };
  ambient: {
    start: (mood?: Mood) => Promise<void>;
    stop: () => void;
    updateMood: (vitals: { mood: number; energy: number }) => void;
  };
}

/**
 * Hook for using the Meta-Pet audio system
 */
export function useAudio(): UseAudioReturn {
  const settingsRef = useRef<AudioSettings>(loadAudioSettings());
  const vitals = useStore((s) => s.vitals);
  const lastAction = useStore((s) => s.lastAction);
  const achievements = useStore((s) => s.achievements);
  const evolution = useStore((s) => s.evolution);

  // Track previous values for change detection
  const prevAchievementsCount = useRef(achievements.length);
  const prevEvolutionState = useRef(evolution.state);

  // Update ambient mood when vitals change
  useEffect(() => {
    updateAmbientMood(vitals);
  }, [vitals.mood, vitals.energy]);

  // Play sound when action occurs
  useEffect(() => {
    if (!lastAction) return;

    switch (lastAction) {
      case "feed":
        void playFeed();
        break;
      case "clean":
        void playClean();
        break;
      case "play":
        void playPlay();
        break;
      case "sleep":
        void playSleep();
        break;
    }
  }, [lastAction]);

  // Play achievement sound when new achievement earned
  useEffect(() => {
    if (achievements.length > prevAchievementsCount.current) {
      void playAchievement();
    }
    prevAchievementsCount.current = achievements.length;
  }, [achievements.length]);

  // Play evolution sound when pet evolves
  useEffect(() => {
    if (evolution.state !== prevEvolutionState.current) {
      void playEvolution();
    }
    prevEvolutionState.current = evolution.state;
  }, [evolution.state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    updateAudioSettings(newSettings);
    settingsRef.current = getAudioSettings();
  }, []);

  const sounds = {
    click: playButtonClick,
    feed: playFeed,
    clean: playClean,
    play: playPlay,
    sleep: playSleep,
    achievement: playAchievement,
    evolution: playEvolution,
    milestone: playMilestone,
    success: playSuccess,
    heptaCode: playHeptaCode,
  };

  const ambient = {
    start: startAmbientMusic,
    stop: stopAmbientMusic,
    updateMood: updateAmbientMood,
  };

  return {
    settings: settingsRef.current,
    updateSettings,
    sounds,
    ambient,
  };
}

export default useAudio;
