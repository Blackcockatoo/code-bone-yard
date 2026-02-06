/**
 * Consciousness Hook
 * Unifies genetics, behavior, sentiment, and environment for the Guardian.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculateComfort, calculateDrives, calculateGBSPState, getExpandedEmotionalState } from '@/guardian/stats';
import type { GuardianAIMode, GuardianField, GuardianPosition, GuardianStats } from '@/guardian/types';
import { getTimeOfDay } from '@/guardian/behavior';
import {
  type ConsciousnessState,
  type PersonalityTraits,
  type ParticleParams,
  applyGeneticModulation,
  consciousnessToResponseContext,
  derivePersonalityTraitsFromStats,
  emotionToParticleParams,
  getEffectivePersonality,
  initializeConsciousness,
  recordExperience,
  refineEmotionalExpression,
} from './consciousness';

export interface UseConsciousnessOptions {
  traits: PersonalityTraits;
  vitals: GuardianStats;
  field: GuardianField;
  position: GuardianPosition;
  fieldResonance: number;
  mode: GuardianAIMode;
}

export interface ConsciousnessActions {
  recordAction: (action: string, impact: number) => void;
  getParticleParams: () => ParticleParams;
  getResponseContext: (vitals: { mood: number; energy: number; hunger: number; hygiene: number }) => ReturnType<typeof consciousnessToResponseContext>;
}

export function useConsciousness(options: UseConsciousnessOptions): [ConsciousnessState, ConsciousnessActions] {
  const { traits, vitals, field, position, fieldResonance, mode } = options;

  const [consciousness, setConsciousness] = useState<ConsciousnessState>(() =>
    initializeConsciousness(traits, vitals, position, fieldResonance, getTimeOfDay())
  );

  useEffect(() => {
    setConsciousness(prev => ({
      ...prev,
      identity: { ...prev.identity, traits },
    }));
  }, [traits]);

  useEffect(() => {
    const prng = field.prng ?? Math.random;
    const awareness = Math.min(100, (vitals.curiosity + vitals.energy) / 2);

    setConsciousness(prev => {
      const effectivePersonality = getEffectivePersonality(prev);
      const baseDrives = calculateDrives(position, field, vitals, awareness, Date.now());
      const modulatedDrives = applyGeneticModulation(baseDrives, effectivePersonality);
      const comfort = calculateComfort(modulatedDrives);

      const gbspState = calculateGBSPState(position, field, vitals, mode, Date.now());
      const baseEmotion = getExpandedEmotionalState(gbspState.drives, comfort, vitals, mode);
      const refinedEmotion = refineEmotionalExpression(baseEmotion, effectivePersonality, prng);

      return {
        ...prev,
        expression: {
          emotional: refinedEmotion,
          drives: modulatedDrives,
          comfort,
          vitals,
        },
        context: {
          position,
          fieldResonance,
          timeOfDay: getTimeOfDay(),
        },
      };
    });
  }, [field, position, vitals.energy, vitals.curiosity, vitals.bond, vitals.health, fieldResonance, mode]);

  const recordAction = useCallback((action: string, impact: number) => {
    setConsciousness(prev => recordExperience(prev, action, prev.expression.emotional, impact));
  }, []);

  const getParticleParams = useCallback(() => {
    return emotionToParticleParams(
      consciousness.expression.emotional,
      consciousness.expression.comfort,
      consciousness.expression.drives
    );
  }, [consciousness.expression]);

  const getResponseContext = useCallback((responseVitals: { mood: number; energy: number; hunger: number; hygiene: number }) => {
    return consciousnessToResponseContext(consciousness, responseVitals);
  }, [consciousness]);

  const actions: ConsciousnessActions = useMemo(
    () => ({
      recordAction,
      getParticleParams,
      getResponseContext,
    }),
    [recordAction, getParticleParams, getResponseContext]
  );

  return [consciousness, actions];
}

export function deriveTraitsFromCurrentState(stats: GuardianStats, field: GuardianField, seed?: string): PersonalityTraits {
  return derivePersonalityTraitsFromStats(stats, field, seed);
}
