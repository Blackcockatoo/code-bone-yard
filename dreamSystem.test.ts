import { generateAIDream } from '../DreamGenerator';
import { DreamGeneratorInput, addDreamToJournal, createDreamJournalState, applyDreamInfluence } from '../DreamJournalSystem';
import { generateRandomGenome, extractPersonality } from '../../mononoke-garden-core/genetics/base7Genome';

async function testDreamSystem() {
  console.log('--- Starting Dream Journal System Test ---');

  const genome = generateRandomGenome();
  const personality = extractPersonality(genome.red60);

  const input: DreamGeneratorInput = {
    petName: 'Steve',
    memoryDepth: 100,
    currentEmotion: 'affectionate',
    kizunaLevel: 5,
    evolutionStage: 'NEURO',
    personality: personality,
    recentActions: ['morning_prayer', 'midday_play', 'evening_meal'],
    isBreeding: false,
    isEvolving: false,
    detailLevel: 'detailed',
  };

  console.log('\n1. Testing AI Dream Generation...');
  const dream = await generateAIDream(input);
  console.log('Generated Dream:', JSON.stringify(dream, null, 2));

  console.log('\n2. Testing Journal Management...');
  let journalState = createDreamJournalState();
  journalState = addDreamToJournal(journalState, dream, 50);
  console.log('Journal Entries:', journalState.journal.length);
  console.log('Last Dream Date:', journalState.lastDreamDate);

  console.log('\n3. Testing Mythic Influence (Personality Drift)...');
  const { newRed60, axis, direction } = applyDreamInfluence(genome.red60, dream);
  const newPersonality = extractPersonality(newRed60);
  console.log(`Drift applied to axis: ${axis}, direction: ${direction}`);
  console.log(`Old ${axis} score: ${personality[axis]}`);
  console.log(`New ${axis} score: ${newPersonality[axis]}`);

  console.log('\n--- Dream Journal System Test Complete ---');
}

testDreamSystem().catch(console.error);
