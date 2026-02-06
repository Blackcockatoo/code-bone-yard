const { OpenAI } = require('openai');

const client = new OpenAI();

// Mocking mapStateToArchetype logic for the JS test
function mapStateToArchetype(input) {
  const { currentEmotion, personality, kizunaLevel, evolutionStage, isBreeding, isEvolving } = input;
  if (evolutionStage === 'QUANTUM' || isBreeding) return 'The Collective Unconscious';
  if (currentEmotion === 'withdrawn' || currentEmotion === 'melancholic' || personality.bravery <= 1) return 'The Shadow';
  if (isEvolving || personality.bravery >= 5 || personality.energy >= 5) return 'The Hero\'s Journey';
  if (kizunaLevel >= 5 || currentEmotion === 'contemplative' || currentEmotion === 'affectionate') return 'The Anima/Animus';
  if (currentEmotion === 'mischievous' || personality.creativity >= 5) return 'The Trickster';
  return 'The Observer';
}

const enhancedScenarios = [
  {
    name: 'The Shadow (Confronting Fear)',
    emotion: 'withdrawn',
    kizuna: 2,
    evolution: 'GENETICS',
    personality: { bravery: 1, energy: 2, creativity: 3 },
    actions: ['rest'],
    type: 'low_emotion',
    detail: 'detailed'
  },
  {
    name: 'The Hero\'s Journey (Evolution)',
    emotion: 'playful',
    kizuna: 4,
    evolution: 'NEURO',
    personality: { bravery: 6, energy: 5, creativity: 4 },
    actions: ['midday_play', 'explore'],
    type: 'evolution',
    detail: 'detailed',
    isEvolving: true
  },
  {
    name: 'Lucid Dreaming (User Influence)',
    emotion: 'affectionate',
    kizuna: 6,
    evolution: 'NEURO',
    personality: { bravery: 3, energy: 4, creativity: 5 },
    actions: ['night_story', 'meditation'],
    type: 'bonding',
    detail: 'mythic',
    lucidDreamKeyword: 'Golden Key'
  },
  {
    name: 'The Collective Unconscious (Quantum Breeding)',
    emotion: 'serene',
    kizuna: 7,
    evolution: 'QUANTUM',
    personality: { bravery: 4, energy: 4, creativity: 6 },
    actions: ['breeding_ceremony'],
    type: 'breeding',
    detail: 'mythic',
    isBreeding: true
  }
];

async function runEnhancedTests() {
  console.log('--- Running Enhanced Dream System Tests ---');

  for (const scenario of enhancedScenarios) {
    console.log(`\nScenario: ${scenario.name}`);
    
    const archetype = mapStateToArchetype(scenario);
    console.log(`Archetype: ${archetype}`);

    const systemPrompt = `You are the subconscious of a digital pet named Steve. 
Generate a poetic, surreal dream narrative.
Detail Level: ${scenario.detail}.
The dream MUST be framed by the Jungian Archetype: ${archetype}.
${scenario.lucidDreamKeyword ? `The narrative MUST prominently feature the user's lucid dream keyword: "${scenario.lucidDreamKeyword}" or its symbolic meaning.` : ''}`;

    const userPrompt = `
Emotion: ${scenario.emotion}
Kizuna: ${scenario.kizuna}/7
Evolution: ${scenario.evolution}
Personality: ${JSON.stringify(scenario.personality)}
Recent Actions: ${scenario.actions.join(', ')}
Context: ${scenario.type}
${scenario.lucidDreamKeyword ? `Lucid Dream Keyword: ${scenario.lucidDreamKeyword}` : ''}`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
      });

      console.log('Narrative:', response.choices[0].message.content.trim());
    } catch (error) {
      console.error(`Error in scenario ${scenario.name}:`, error.message);
    }
  }

  console.log('\n--- Enhanced Tests Complete ---');
}

runEnhancedTests();
