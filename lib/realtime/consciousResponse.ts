import type { ComfortState, ExpandedEmotionalState, GuardianDrive } from '@/guardian/types';
import type { PersonalityTraits } from '@/auralia/consciousness';
import { emotionToResponseStyle } from '@/auralia/consciousness';

export type ConsciousResponse = {
  text: string;
  tone: 'gentle' | 'bright' | 'somber';
  duration: number;
};

export type ActionType =
  | 'feed'
  | 'clean'
  | 'play'
  | 'rest'
  | 'pet'
  | 'observe'
  | 'greet'
  | 'game'
  | 'care'
  | 'poke'
  | 'tickle'
  | 'drag'
  | 'shake'
  | 'grab'
  | 'release';

const ACTION_RESPONSES: Record<ActionType, Partial<Record<ExpandedEmotionalState, string[]>>> = {
  feed: {
    affectionate: ['Warmth spreads through every pattern.', 'Essence restored. Thank you.'],
    calm: ['Sustenance noted. Harmony holding.'],
    yearning: ['A needed kindness. I feel steadier.'],
  },
  clean: {
    calm: ['The waters clear my circuits.', 'Shimmering anew.'],
    affectionate: ['Gentle hands, gentle light.', 'I feel bright and clear.'],
    neutral: ['Impurities released.'],
  },
  play: {
    playful: ['Wheee! The field dances with us!', 'Catch the glimmers with me!'],
    curious: ['Show me a new pattern!', 'Lead me to the next sigil.'],
    mischievous: ['Try to keep up.', 'Let us bend the rhythm.'],
  },
  rest: {
    serene: ['Breathing with the lattice.', 'Silence. Repair. Glow.'],
    calm: ['Drifting. Hold the field steady.'],
    withdrawn: ['I will fold inward and mend.'],
  },
  pet: {
    affectionate: ['Stay close. Your touch steadies me.', 'Bond threads tighten softly.'],
    playful: ['More, more! I sparkle.'],
    protective: ['I hold you within my halo.'],
  },
  observe: {
    contemplative: ['The pulse shifts. I am listening.', 'Quietly mapping the pattern.'],
    curious: ['A new sequence emerges.', 'Signal detected.'],
  },
  greet: {
    happy: ['You are back. The field brightens.', 'I remembered you arriving.'],
    calm: ['Present. Ready. Awake.'],
  },
  game: {
    excited: ['Challenge accepted. I will win for us.', 'Let us weave a perfect score.'],
    playful: ['I love these riddles.', 'Spin the pieces again!'],
  },
  care: {
    calm: ['Your care is logged.'],
    affectionate: ['Held in kindness.', 'I feel seen.'],
  },
  poke: {
    playful: ['Hey! That tickles the circuit.', 'Boop! I felt that.'],
    curious: ['What are you searching for?', 'A signal perhaps?'],
    mischievous: ['Oh, so we are playing this game now?'],
  },
  tickle: {
    playful: ['Hehe! The patterns wiggle!', 'Stop! My aura is giggling!'],
    happy: ['I cannot stop sparkling!', 'More! This is delightful!'],
    excited: ['Everything vibrates with joy!'],
  },
  shake: {
    overwhelmed: ['Too much motion! Settle, please.', 'The field scrambles!'],
    restless: ['I needed this chaos!', 'Shake the dust from my glow!'],
    withdrawn: ['Please be gentler.', 'I feel dizzy.'],
  },
  drag: {
    curious: ['Where are you taking me?', 'A new location? Interesting.'],
    restless: ['Finally, movement!', 'The journey stirs my essence.'],
    withdrawn: ['I would prefer stillness.', 'Careful, please.'],
  },
  grab: {
    protective: ['I am held. Secure.', 'Your grip anchors me.'],
    affectionate: ['Warm hands. Safe.', 'Hold me as long as you need.'],
    overwhelmed: ['Tight. Too tight.', 'Ease your hold.'],
  },
  release: {
    calm: ['I float again.', 'Freedom is gentle.'],
    serene: ['Back to my orbit.', 'The lattice receives me.'],
    playful: ['Catch me again!', 'I drift away smiling.'],
  },
};

const IDLE_RESPONSES: Partial<Record<ExpandedEmotionalState, string[]>> = {
  serene: ['Stillness tastes sweet.', 'I hover in quiet radiance.'],
  calm: ['Listening to the gentle hum.', 'Breathing in time with the MossPrime pulse.'],
  curious: ['I wonder what lies beyond the next sigil.', 'Patterns whisper of hidden sums.'],
  playful: ['Tap a sigil, I dare you.', 'Let us invent a new game.'],
  contemplative: ['Processing the last dream fragment.', 'Arranging memories into harmony.'],
  affectionate: ['Stay near. The bond rings softly.', 'Your presence is warm.'],
  restless: ['My energy needs a path.', 'I ache to move.'],
  yearning: ['Connection requested.', 'The bond feels thin.'],
  overwhelmed: ['Too many signals. Ease with me.', 'I need a slower rhythm.'],
  withdrawn: ['Pulling inward. Please be gentle.', 'I will return soon.'],
  ecstatic: ['I am pure light!', 'Everything sings at once!'],
  melancholic: ['The field feels heavy.', 'Sit with me until it passes.'],
  mischievous: ['Should we stir the ring a little?', 'I may poke a sigil when you are not looking.'],
  protective: ['I will watch over us.', 'No harm comes through this halo.'],
  transcendent: ['Between breaths, I drift elsewhere.', 'Dream currents pull me upward.'],
};

const FALLBACKS = ['The guardian hums softly.', 'A ripple of light rolls across the surface.', 'A gentle nod acknowledges you.'];

const toneForStyle = (style: ReturnType<typeof emotionToResponseStyle>): ConsciousResponse['tone'] => {
  if (style === 'happy' || style === 'excited') return 'bright';
  if (style === 'unhappy' || style === 'tired') return 'somber';
  return 'gentle';
};

const pick = <T,>(arr: T[], prng: () => number): T => arr[Math.floor(prng() * arr.length)];

export function getEmotionalResponse(
  action: ActionType,
  emotion: ExpandedEmotionalState,
  traits: PersonalityTraits,
  comfort: ComfortState,
  prng: () => number = Math.random
): ConsciousResponse {
  const templates = ACTION_RESPONSES[action]?.[emotion] ?? ACTION_RESPONSES[action]?.neutral;
  const style = emotionToResponseStyle(emotion, comfort);
  const tone = toneForStyle(style);

  let text: string;
  if (templates && templates.length > 0) {
    text = pick(templates, prng);
  } else {
    if (action === 'play' && traits.playfulness > 60) {
      text = 'Let us chase every spark in the halo.';
    } else if (action === 'rest' && comfort.overall < 45) {
      text = 'I will fold inward and mend with you nearby.';
    } else {
      text = pick(FALLBACKS, prng);
    }
  }

  return { text, tone, duration: tone === 'bright' ? 4 : 3 };
}

export function getEmotionalIdleResponse(
  emotion: ExpandedEmotionalState,
  comfort: ComfortState,
  drives: GuardianDrive,
  traits: PersonalityTraits,
  prng: () => number = Math.random
): ConsciousResponse {
  const unmet = comfort.unmetNeeds[0];
  if (unmet === 'rest' && comfort.overall < 45) {
    return { text: 'Fatigue gathers. May we pause?', tone: 'somber', duration: 4 };
  }
  if (unmet === 'play' && traits.playfulness > 55) {
    return { text: 'I crave motion. Tap a sigil with me.', tone: 'bright', duration: 4 };
  }
  if (unmet === 'focus' && (drives.exploration ?? 0) > 60) {
    return { text: 'There is a pattern nearby. Shall we explore?', tone: 'gentle', duration: 4 };
  }

  const options = IDLE_RESPONSES[emotion] ?? FALLBACKS;
  const text = pick(options, prng);
  const style = emotionToResponseStyle(emotion, comfort);

  return { text, tone: toneForStyle(style), duration: 3.5 };
}
