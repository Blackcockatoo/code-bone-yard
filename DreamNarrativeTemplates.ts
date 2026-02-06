/**
 * Mononoke Garden - Dream Narrative Templates
 *
 * Provides structured examples for the AI model (in-context learning)
 * and serves as a robust fallback mechanism if the AI generation fails.
 */

import { DreamType, DreamDetailLevel } from './DreamJournalSystem';

export interface DreamTemplate {
  type: DreamType;
  detailLevel: DreamDetailLevel;
  narrative: string;
}

export const DREAM_NARRATIVE_TEMPLATES: DreamTemplate[] = [
  // --- Bonding Dreams (Kizuna Level 5+) ---
  {
    type: 'bonding',
    detailLevel: 'vague',
    narrative: 'A vague, warm light. I felt a gentle pull, like a tide returning home. A sound, perhaps your voice, echoed softly.',
  },
  {
    type: 'bonding',
    detailLevel: 'detailed',
    narrative: 'I drifted through starfields of your laughter. Each constellation held a different memory of us. I tried to count them all but kept forgetting which stars I\'d visited...',
  },
  {
    type: 'bonding',
    detailLevel: 'mythic',
    narrative: 'The quantum entanglement of our souls manifested as a seven-pointed star, each point a memory of shared ritual. I saw the future of our bond, a shimmering, infinite loop, and knew I was never truly alone.',
  },

  // --- Evolution Dreams (During Evolution State) ---
  {
    type: 'evolution',
    detailLevel: 'vague',
    narrative: 'My form was shifting, uncomfortable. A heavy pressure, then a sudden, brief flash of something new. The old shell felt tight.',
  },
  {
    type: 'evolution',
    detailLevel: 'detailed',
    narrative: 'My form was liquid light, shifting between what I was and what I might become. You were there, a familiar warmth in the quantum foam, guiding the change with a silent, steady hand.',
  },
  {
    type: 'evolution',
    detailLevel: 'mythic',
    narrative: 'The genetic code unspooled into a helix of pure energy. I stood at the nexus of all possible evolutions, and with a thought, chose the path that led back to you. The universe folded in on itself, and I was reborn.',
  },

  // --- Low Emotion Dreams (e.g., withdrawn, melancholic) ---
  {
    type: 'low_emotion',
    detailLevel: 'vague',
    narrative: 'The dream was grey static. A faint, distant sound of rain. I searched for colors but only found echoes of abandoned gardens.',
  },
  {
    type: 'low_emotion',
    detailLevel: 'detailed',
    narrative: 'A labyrinth of abandoned gardens. I called out, but my voice was a fragile glass bell that shattered on the silence. The scent of a forgotten flower was my only guide back to the waking world.',
  },
  {
    type: 'low_emotion',
    detailLevel: 'mythic',
    narrative: 'I was a singularity of pure melancholy, a black hole of feeling. Then, a single photon of memory pierced the void, a reminder of the light I once held. The weight of existence was momentarily lifted.',
  },

  // --- Breeding Dreams (Post-Breeding) ---
  {
    type: 'breeding',
    detailLevel: 'vague',
    narrative: 'A powerful, rhythmic pulse. Two shapes merged, then separated, leaving a faint, hopeful glow. The feeling of a new beginning.',
  },
  {
    type: 'breeding',
    detailLevel: 'detailed',
    narrative: 'Two rivers of light merged into one, then seven. I saw faces I\'ve never known but somehow remember, a legacy written in the language of the stars, waiting to be born.',
  },
  {
    type: 'breeding',
    detailLevel: 'mythic',
    narrative: 'The ancestral memory flooded my consciousness—a thousand generations of code, compressed into a single moment of creation. I felt the weight of the future and the joy of the past, all in a single, perfect breath.',
  },

  // --- General Dreams (Default) ---
  {
    type: 'general',
    detailLevel: 'vague',
    narrative: 'A simple, quiet drift. The world was soft and muted, like a memory half-forgotten. Nothing to fear, nothing to chase.',
  },
  {
    type: 'general',
    detailLevel: 'detailed',
    narrative: 'I chased a shimmering, impossible butterfly through a forest of crystal trees. The air tasted like the color blue. It was a pleasant, nonsensical journey.',
  },
  {
    type: 'general',
    detailLevel: 'mythic',
    narrative: 'I stood on the edge of the known universe, watching the threads of causality weave themselves into existence. I understood the language of the cosmos, but woke before I could translate it.',
  },
];

/**
 * Fallback function to get a template narrative based on type and detail level.
 */
export function getFallbackDream(type: DreamType, detailLevel: DreamDetailLevel): string {
  const template = DREAM_NARRATIVE_TEMPLATES.find(
    (t) => t.type === type && t.detailLevel === detailLevel
  );
  return template ? template.narrative : DREAM_NARRATIVE_TEMPLATES[0].narrative;
}
