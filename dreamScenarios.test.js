const { OpenAI } = require('openai');

const client = new OpenAI();

const scenarios = [
  {
    name: 'Post-Bonding (High Kizuna)',
    emotion: 'affectionate',
    kizuna: 6,
    evolution: 'NEURO',
    actions: ['night_story', 'meditation', 'shrine_visit'],
    type: 'bonding',
    detail: 'detailed'
  },
  {
    name: 'During Evolution',
    emotion: 'contemplative',
    kizuna: 4,
    evolution: 'GENETICS',
    actions: ['morning_prayer', 'midday_play'],
    type: 'evolution',
    detail: 'detailed'
  },
  {
    name: 'Low Emotion State',
    emotion: 'withdrawn',
    kizuna: 2,
    evolution: 'GENETICS',
    actions: ['rest'],
    type: 'low_emotion',
    detail: 'vague'
  },
  {
    name: 'Mythic Post-Breeding',
    emotion: 'serene',
    kizuna: 7,
    evolution: 'QUANTUM',
    actions: ['breeding_ceremony', 'celebrate'],
    type: 'breeding',
    detail: 'mythic'
  }
];

async function runScenarios() {
  console.log('--- Running Dream Scenario Tests ---');

  for (const scenario of scenarios) {
    console.log(`\nScenario: ${scenario.name}`);
    
    const systemPrompt = `You are the subconscious of a digital pet named Steve. 
Generate a poetic, surreal dream narrative.
Detail Level: ${scenario.detail}.`;

    const userPrompt = `
Emotion: ${scenario.emotion}
Kizuna: ${scenario.kizuna}/7
Evolution: ${scenario.evolution}
Recent Actions: ${scenario.actions.join(', ')}
Context: ${scenario.type}`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
      });

      console.log('Narrative:', response.choices[0].message.content.trim());
    } catch (error) {
      console.error(`Error in scenario ${scenario.name}:`, error.message);
    }
  }

  console.log('\n--- Scenario Tests Complete ---');
}

runScenarios();
