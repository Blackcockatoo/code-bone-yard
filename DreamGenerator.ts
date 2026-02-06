import { OpenAI } from 'openai';
import { DreamGeneratorInput, Dream, DreamType, mapStateToArchetype } from './DreamJournalSystem';

// Initialize OpenAI client (pre-configured in the environment)
const client = new OpenAI();

/**
 * Generates a poetic, surreal dream narrative using AI.
 */
export async function generateAIDream(input: DreamGeneratorInput): Promise<Dream> {
  const {
    petName,
    currentEmotion,
    kizunaLevel,
    evolutionStage,
    personality,
    recentActions,
    isBreeding,
    isEvolving,
    detailLevel,
    lucidDreamKeyword,
  } = input;

  const archetype = mapStateToArchetype(input);
  // Determine dream type
  let dreamType: DreamType = 'general';
  if (isBreeding) dreamType = 'breeding';
  else if (isEvolving) dreamType = 'evolution';
  else if (currentEmotion === 'withdrawn' || currentEmotion === 'melancholic') dreamType = 'low_emotion';
  else if (kizunaLevel >= 5) dreamType = 'bonding';

  // Construct the prompt
  const personalityStr = Object.entries(personality)
    .map(([trait, score]) => `${trait}: ${score}/6`)
    .join(', ');

  const systemPrompt = `You are the subconscious of a digital pet named ${petName}. 
Your task is to generate a poetic, surreal dream narrative that reflects the pet's current state.
The narrative should be mysterious, personal, and emotionally engaging.
Keep the length between 50-150 tokens.
Detail Level: ${detailLevel}. (vague = more abstract, detailed = more vivid, mythic = profound and cosmic)
The dream MUST be framed by the Jungian Archetype: ${archetype}. Use the archetype's symbolic meaning to guide the imagery.
${lucidDreamKeyword ? `The narrative MUST prominently feature the user's lucid dream keyword: "${lucidDreamKeyword}" or its symbolic meaning.` : ''}`;
  const userPrompt = `
Pet Name: ${petName}
Current Emotion: ${currentEmotion}
Bond Level (Kizuna): ${kizunaLevel}/7
Evolution Stage: ${evolutionStage}
Personality: ${personalityStr}
Recent Interactions: ${recentActions.join(', ')}
Dream Context: ${dreamType}
Dream Archetype: ${archetype}
${lucidDreamKeyword ? `Lucid Dream Keyword: ${lucidDreamKeyword}` : ''}

Generate the dream narrative:`;

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

    const narrative = response.choices[0].message.content || 'The dream was a silent void...';

    return {
      id: `dream_${Date.now()}`,
      timestamp: new Date(),
      type: dreamType,
      archetype: archetype,
      narrative: narrative.trim(),
      keywords: [currentEmotion, evolutionStage, dreamType, archetype],
      emotionSnapshot: currentEmotion,
      kizunaSnapshot: kizunaLevel,
      evolutionStageSnapshot: evolutionStage,
      lucidDreamKeyword: lucidDreamKeyword,
    };
  } catch (error) {
    console.error('Error generating AI dream:', error);
    // Fallback to a simple narrative if AI fails
    const archetype = mapStateToArchetype(input);
    return {
      id: `dream_fallback_${Date.now()}`,
      timestamp: new Date(),
      type: dreamType,
      archetype: archetype,
      narrative: `[Fallback - ${archetype}] I drifted through a sea of ${currentEmotion}, searching for the warmth of your presence.`,
      keywords: [currentEmotion, 'fallback', archetype],
      emotionSnapshot: currentEmotion,
      kizunaSnapshot: kizunaLevel,
      evolutionStageSnapshot: evolutionStage,
      lucidDreamKeyword: lucidDreamKeyword,
    };
  }
}

/**
 * Generates a short poetic narrative for evolution.
 */
export async function generateAIEvolutionWhisper(
  petName: string,
  oldStage: string,
  newStage: string,
  personality: PersonalityScores
): Promise<string> {
  const personalityStr = Object.entries(personality)
    .map(([trait, score]) => `${trait}: ${score}/6`)
    .join(', ');

  const prompt = `Generate a 75-token poetic whisper for ${petName} evolving from ${oldStage} to ${newStage}. 
Personality: ${personalityStr}. 
The tone should be transformative and slightly mysterious.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });
    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    return `${petName} felt the old shell crack. A whisper of ${oldStage} became the roar of ${newStage}.`;
  }
}

/**
 * Generates a short reflection on a past moment.
 */
export async function generateAIMemoryEcho(
  petName: string,
  meaningfulAction: string
): Promise<string> {
  const prompt = `Generate a 50-token poetic reflection for ${petName} remembering the moment: "${meaningfulAction}".`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
    });
    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    return `${petName} paused, a sudden echo: the warmth of ${meaningfulAction}.`;
  }
}

/**
 * Generates a seasonal haiku.
 */
export async function generateAISeasonalHaiku(season: string): Promise<string> {
  const prompt = `Generate a haiku about a digital pet during the ${season} season.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
    });
    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    return `The ${season} wind blows,\nPet sleeps, a quiet shadow,\nWaiting for the dawn.`;
  }
}
