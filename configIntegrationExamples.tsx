/**
 * Config Integration Examples
 *
 * Shows how to integrate appConfig throughout your existing codebase
 * without major refactoring - just gate what's visible/enabled.
 */

import { getConfig, can } from './appConfig';
import type { ExpandedEmotionalState } from './consciousness';
import type { Genome, DerivedTraits } from './genome/types';

// ===== EXAMPLE 1: EMOTION FILTERING =====
// In your consciousness system, filter emotions based on tier

export function getFilteredEmotionalState(
  rawEmotion: ExpandedEmotionalState
): ExpandedEmotionalState {
  const config = getConfig();

  // Check if this emotion is enabled for current tier
  if (config.emotions.enabledStates.has(rawEmotion)) {
    return rawEmotion;
  }

  // If not, map to closest enabled emotion
  const emotionFallbacks: Record<ExpandedEmotionalState, ExpandedEmotionalState> = {
    serene: 'calm',
    calm: 'calm',
    curious: 'curious',
    playful: 'playful',
    contemplative: 'contemplative',
    affectionate: 'affectionate',
    restless: 'restless',
    yearning: 'restless', // Map to restless
    overwhelmed: 'restless', // Map to restless
    withdrawn: 'withdrawn',
    ecstatic: 'playful', // Map to playful
    melancholic: 'withdrawn', // Map to withdrawn
    mischievous: 'playful', // Map to playful
    protective: 'affectionate', // Map to affectionate
    transcendent: 'serene', // Map to serene
  };

  const fallback = emotionFallbacks[rawEmotion];

  // Ensure fallback is also enabled, else use 'calm'
  return config.emotions.enabledStates.has(fallback) ? fallback : 'calm';
}

// ===== EXAMPLE 2: COMPANION LIMIT CHECK =====
// Before allowing new companion creation

export function canCreateCompanion(currentCompanions: number): {
  allowed: boolean;
  reason?: string;
} {
  const allowed = can.addCompanion(currentCompanions);

  if (!allowed) {
    return {
      allowed: false,
      reason: `You've reached your companion limit (${currentCompanions}). Upgrade to nurture more souls.`,
    };
  }

  return { allowed: true };
}

// ===== EXAMPLE 3: GENOME UI RENDERING =====
// Conditionally render genome details

export function GenomeDisplay({ genome, traits }: { genome: Genome; traits: DerivedTraits }) {
  const config = getConfig();

  return (
    <div className="genome-display">
      {/* Everyone sees basic traits */}
      <BasicTraitSummary traits={traits} />

      {/* Premium+ sees trait breakdown */}
      {config.genome.showTraitBreakdown && (
        <TraitBreakdown traits={traits} />
      )}

      {/* Premium+ sees element web */}
      {config.genome.showElementWeb && (
        <ElementWebVisualization traits={traits.elementWeb} />
      )}

      {/* Premium+ sees bridge score */}
      {config.genome.showBridgeScore && (
        <BridgeScoreDisplay
          score={traits.elementWeb.bridgeCount}
          frontier={traits.elementWeb.frontierAffinity}
        />
      )}

      {/* Premium+ can open full genome lab */}
      {config.genome.showGenomeLab && (
        <button onClick={() => openGenomeLab(genome)}>
          Open Genome Lab
        </button>
      )}

      {/* Mythic Mode shows raw DNA */}
      {config.genome.canViewDNA && (
        <RawDNAViewer genome={genome} />
      )}
    </div>
  );
}

function BasicTraitSummary({ traits }: { traits: DerivedTraits }) {
  const config = getConfig();

  return (
    <div className="basic-traits">
      <div className="physical">
        <h3>Appearance</h3>
        <p>{traits.physical.bodyType}</p>
        <div className="colors">
          <div style={{ background: traits.physical.primaryColor }} />
          <div style={{ background: traits.physical.secondaryColor }} />
        </div>
        <p>{traits.physical.pattern} pattern</p>
      </div>

      <div className="personality">
        <h3>Personality</h3>
        <p>{traits.personality.temperament}</p>

        {/* Show detailed stats only if enabled */}
        {config.ui.showAdvancedStats && (
          <div className="stat-bars">
            <StatBar label="Energy" value={traits.personality.energy} />
            <StatBar label="Curiosity" value={traits.personality.curiosity} />
            <StatBar label="Affection" value={traits.personality.affection} />
          </div>
        )}
      </div>
    </div>
  );
}

function TraitBreakdown({ traits }: { traits: DerivedTraits }) {
  return (
    <div className="trait-breakdown">
      <h4>Trait Sources</h4>
      <p className="explanation">
        Your companion's traits emerge from their unique genetic code.
      </p>
      {/* Detailed breakdown here */}
    </div>
  );
}

function ElementWebVisualization({ elementWeb }: { elementWeb: any }) {
  return (
    <div className="element-web">
      <svg width="200" height="200">
        {/* Render element web visualization */}
      </svg>
    </div>
  );
}

function BridgeScoreDisplay({ score, frontier }: { score: number; frontier: number }) {
  return (
    <div className="bridge-score">
      <div>Bridge: {score}</div>
      <div>Frontier: {frontier}</div>
    </div>
  );
}

function RawDNAViewer({ genome }: { genome: Genome }) {
  return (
    <div className="raw-dna">
      <h4>Raw Genome</h4>
      <div className="dna-strand red">Red: {genome.red60.join('')}</div>
      <div className="dna-strand blue">Blue: {genome.blue60.join('')}</div>
      <div className="dna-strand black">Black: {genome.black60.join('')}</div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-bar">
      <span>{label}</span>
      <div className="bar">
        <div className="fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function openGenomeLab(genome: Genome) {
  // Open full genome lab interface
  console.log('Opening Genome Lab with genome:', genome);
}

// ===== EXAMPLE 4: PARTICLE FIELD RENDERING =====
// Adjust particle count based on tier and battery mode

export function ParticleField({ emotion }: { emotion: ExpandedEmotionalState }) {
  const config = getConfig();

  // Skip if particles disabled
  if (!config.visuals.enableParticleFields) {
    return null;
  }

  // Calculate appropriate particle count
  const baseCount = getParticleCountForEmotion(emotion);
  const cappedCount = Math.min(baseCount, config.visuals.maxParticleCount);

  return (
    <div className="particle-field">
      {Array.from({ length: cappedCount }).map((_, i) => (
        <Particle key={i} index={i} emotion={emotion} />
      ))}
    </div>
  );
}

function getParticleCountForEmotion(emotion: ExpandedEmotionalState): number {
  const counts: Record<ExpandedEmotionalState, number> = {
    serene: 8,
    calm: 12,
    curious: 20,
    playful: 25,
    contemplative: 10,
    affectionate: 15,
    restless: 22,
    yearning: 18,
    overwhelmed: 30,
    withdrawn: 6,
    ecstatic: 35,
    melancholic: 10,
    mischievous: 24,
    protective: 16,
    transcendent: 40,
  };

  return counts[emotion] || 12;
}

function Particle({ index, emotion }: { index: number; emotion: ExpandedEmotionalState }) {
  // Render individual particle
  return <div className="particle" />;
}

// ===== EXAMPLE 5: RITUAL/INTERACTION FILTERING =====
// Only show rituals available to current tier

export function RitualMenu() {
  const config = getConfig();

  const allRituals = [
    { id: 'resonate', name: 'Resonate', icon: '🎵' },
    { id: 'play', name: 'Play', icon: '🎮' },
    { id: 'rest', name: 'Rest', icon: '😴' },
    { id: 'feed', name: 'Feed', icon: '🍽️' },
    { id: 'clean', name: 'Clean', icon: '🚿' },
    { id: 'attune', name: 'Attune', icon: '🔮', premium: true },
    { id: 'explore', name: 'Explore', icon: '🗺️', premium: true },
    { id: 'meditate', name: 'Meditate', icon: '🧘', premium: true },
    { id: 'celebrate', name: 'Celebrate', icon: '🎉', premium: true },
    { id: 'dream-weave', name: 'Dream Weave', icon: '✨', premium: true },
  ];

  return (
    <div className="ritual-menu">
      {allRituals.map((ritual) => {
        const isEnabled = can.useRitual(ritual.id);
        const isLocked = !isEnabled && ritual.premium;

        return (
          <button
            key={ritual.id}
            className={isLocked ? 'locked' : 'available'}
            onClick={() => isEnabled && performRitual(ritual.id)}
            disabled={!isEnabled}
          >
            <span className="icon">{ritual.icon}</span>
            <span className="name">{ritual.name}</span>
            {isLocked && <span className="lock">🔒</span>}
          </button>
        );
      })}
    </div>
  );
}

function performRitual(ritualId: string) {
  console.log('Performing ritual:', ritualId);
}

// ===== EXAMPLE 6: EVOLUTION STAGE GATING =====
// Control how far pets can evolve

export function canEvolveToStage(currentStage: number, nextStage: number): {
  allowed: boolean;
  reason?: string;
} {
  const config = getConfig();

  if (!config.evolution.enabled) {
    return {
      allowed: false,
      reason: 'Evolution is not available in this version.',
    };
  }

  if (nextStage > config.evolution.maxStage) {
    return {
      allowed: false,
      reason: `Evolution beyond ${getStageName(config.evolution.maxStage)} requires premium access.`,
    };
  }

  return { allowed: true };
}

function getStageName(stage: number): string {
  const names = ['GENETICS', 'NEURO', 'QUANTUM', 'SPECIATION'];
  return names[stage - 1] || 'Unknown';
}

// ===== EXAMPLE 7: AUDIO SCALE SELECTION =====
// Filter audio scales based on tier

export function selectAvailableScale(
  desiredScale: string,
  stats: any
): string {
  const config = getConfig();

  // Check if desired scale is available
  if (can.useScale(desiredScale)) {
    return desiredScale;
  }

  // Fallback to first available scale
  const availableScales = Array.from(config.audio.enabledScales);
  return availableScales[0] || 'pentatonic';
}

// ===== EXAMPLE 8: CONSCIOUSNESS READOUT =====
// Show different levels of detail based on mode

export function ConsciousnessPanel({ consciousness }: { consciousness: any }) {
  const config = getConfig();

  if (!config.consciousness.showConsciousnessReadout) {
    // Simple mode: just show emotion emoji
    return (
      <div className="simple-mood">
        <span className="emoji">{getEmotionEmoji(consciousness.expression.emotional)}</span>
      </div>
    );
  }

  // Advanced mode
  return (
    <div className="consciousness-panel">
      <EmotionDisplay
        emotion={consciousness.expression.emotional}
        showDetails={config.emotions.showEmotionDetails}
      />

      {config.emotions.showDriveMeters && (
        <DriveMeters drives={consciousness.expression.drives} />
      )}

      {config.ui.showMathematicalReadouts && (
        <FieldResonanceReadout resonance={consciousness.context.fieldResonance} />
      )}
    </div>
  );
}

function getEmotionEmoji(emotion: ExpandedEmotionalState): string {
  const emojis: Record<ExpandedEmotionalState, string> = {
    serene: '😌',
    calm: '😊',
    curious: '🤔',
    playful: '😄',
    contemplative: '🧘',
    affectionate: '💕',
    restless: '😤',
    yearning: '🥺',
    overwhelmed: '😵',
    withdrawn: '😔',
    ecstatic: '🤩',
    melancholic: '😢',
    mischievous: '😏',
    protective: '🛡️',
    transcendent: '✨',
  };

  return emojis[emotion] || '😐';
}

function EmotionDisplay({ emotion, showDetails }: { emotion: ExpandedEmotionalState; showDetails: boolean }) {
  return (
    <div className="emotion-display">
      <span className="emoji">{getEmotionEmoji(emotion)}</span>
      {showDetails && <span className="name">{emotion}</span>}
    </div>
  );
}

function DriveMeters({ drives }: { drives: any }) {
  return (
    <div className="drive-meters">
      <StatBar label="Resonance" value={drives.resonance * 100} />
      <StatBar label="Exploration" value={drives.exploration * 100} />
      <StatBar label="Connection" value={drives.connection * 100} />
      <StatBar label="Rest" value={drives.rest * 100} />
      <StatBar label="Expression" value={drives.expression * 100} />
    </div>
  );
}

function FieldResonanceReadout({ resonance }: { resonance: number }) {
  return (
    <div className="field-resonance">
      <span>Field Resonance: {(resonance * 100).toFixed(1)}%</span>
    </div>
  );
}

// ===== EXAMPLE 9: PAYWALL COMPONENT =====
// Non-punishing upgrade prompt

export function UpgradePrompt({ feature }: { feature: keyof typeof import('./appConfig').PAYWALL_MESSAGES }) {
  const config = getConfig();
  const message = require('./appConfig').PAYWALL_MESSAGES[feature];

  return (
    <div className="upgrade-prompt gentle">
      <div className="icon">✨</div>
      <h3>{message.title}</h3>
      <p>{message.message}</p>
      <button className="cta-primary">{message.cta}</button>
      <button className="cta-secondary">Maybe Later</button>
    </div>
  );
}

// ===== EXAMPLE 10: COSMETIC PACK UI =====
// Show available cosmetic packs

export function CosmeticShop() {
  const config = getConfig();
  const packs = require('./appConfig').COSMETIC_PACKS;

  return (
    <div className="cosmetic-shop">
      <h2>Aesthetic Collections</h2>
      <div className="packs">
        {Object.entries(packs).map(([key, pack]: [string, any]) => {
          const isAvailable = can.useCosmeticPack(key);
          const isPurchased = config.visuals.cosmeticPacksAvailable.includes(key);

          return (
            <div key={key} className={`pack ${!isAvailable && 'locked'}`}>
              <h3>{pack.name}</h3>
              <div className="preview">
                {pack.colors.map((color: string) => (
                  <div key={color} style={{ background: color }} />
                ))}
              </div>
              <ul className="features">
                {pack.features.map((feature: string) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {!isPurchased ? (
                <button className="purchase">
                  {pack.price === 0 ? 'Included' : `$${pack.price}`}
                </button>
              ) : (
                <div className="owned">Owned ✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
