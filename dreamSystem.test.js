const { OpenAI } = require('openai');

// Mocking the required parts since we can't easily run TS with ESM here
const DREAM_TYPES = ['bonding', 'evolution', 'low_emotion', 'breeding', 'general'];

async function testDreamGeneration() {
  console.log('--- Starting Dream Generation Test (JS) ---');
  
  const client = new OpenAI();
  
  const petName = 'Steve';
  const currentEmotion = 'affectionate';
  const kizunaLevel = 5;
  const evolutionStage = 'NEURO';
  const personalityStr = 'shyness: 2/6, emotionality: 4/6, energy: 5/6, sociability: 6/6, bravery: 3/6, creativity: 5/6, openness: 4/6';
  const recentActions = ['morning_prayer', 'midday_play', 'evening_meal'];
  const detailLevel = 'detailed';
  const dreamType = 'bonding';

  const systemPrompt = `You are the subconscious of a digital pet named ${petName}. 
Your task is to generate a poetic, surreal dream narrative that reflects the pet's current state.
The narrative should be mysterious, personal, and emotionally engaging.
Keep the length between 50-150 tokens.
Detail Level: ${detailLevel}. (vague = more abstract, detailed = more vivid, mythic = profound and cosmic)`;

  const userPrompt = `
Pet Name: ${petName}
Current Emotion: ${currentEmotion}
Bond Level (Kizuna): ${kizunaLevel}/7
Evolution Stage: ${evolutionStage}
Personality: ${personalityStr}
Recent Interactions: ${recentActions.join(', ')}
Dream Context: ${dreamType}

Generate the dream narrative:`;

  console.log('Calling AI for dream generation...');
  
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const narrative = response.choices[0].message.content;
    console.log('\n--- Generated Dream Narrative ---');
    console.log(narrative);
    console.log('----------------------------------');
    
    console.log('\nTest successful!');
  } catch (error) {
    console.error('Error during AI call:', error);
  }
}

testDreamGeneration();
