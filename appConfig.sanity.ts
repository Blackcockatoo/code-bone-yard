declare const process: { exitCode?: number };

import {
  enableBatteryMode,
  getConfig,
  subscribeToConfigChanges,
  toggleMode,
  upgradeTier,
  type AppConfig,
} from '../appConfig';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected: ${String(expected)}, Received: ${String(actual)}`);
  }
}

function assertNotEqual<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) {
    throw new Error(`${message}. Value: ${String(actual)}`);
  }
}

async function run() {
  const seenConfigs: AppConfig[] = [];
  const unsubscribe = subscribeToConfigChanges((config) => {
    seenConfigs.push(config);
  });

  // Upgrade to premium so mode toggling is allowed
  upgradeTier('premium');
  const initialConfig = getConfig();

  toggleMode();
  const mythicConfig = getConfig();

  assertEqual(mythicConfig.mode, 'mythic', 'Toggle should switch to mythic mode for premium tiers');
  assertNotEqual(
    mythicConfig,
    initialConfig,
    'Config reference should change after toggle to notify subscribers'
  );

  enableBatteryMode(true);
  const batteryConfig = getConfig();

  assert(batteryConfig.performance.batteryMode, 'Battery mode should be enabled');
  assertEqual(batteryConfig.performance.targetFPS, 30, 'Battery mode should lower FPS');
  assertEqual(
    batteryConfig.visuals.enableQuantumEffects,
    false,
    'Battery mode should disable quantum effects'
  );
  assert(
    batteryConfig.visuals.maxParticleCount <= mythicConfig.visuals.maxParticleCount,
    'Battery mode should reduce or maintain particle count'
  );

  enableBatteryMode(false);
  const restoredConfig = getConfig();
  assert(
    restoredConfig.performance.targetFPS >= batteryConfig.performance.targetFPS,
    'Disabling battery mode should restore higher FPS'
  );
  assertEqual(restoredConfig.performance.batteryMode, false, 'Battery mode should be disabled');

  unsubscribe();

  assert(
    seenConfigs.length >= 3,
    'Subscribers should be notified for tier upgrade, mode toggle, and battery mode changes'
  );
  for (let i = 1; i < seenConfigs.length; i += 1) {
    assertNotEqual(
      seenConfigs[i],
      seenConfigs[i - 1],
      'Each notification should deliver a fresh config object reference'
    );
  }

  // Reset to free for cleanliness
  upgradeTier('free');
}

run()
  .then(() => {
    console.log('Sanity checks passed');
  })
  .catch((error) => {
    console.error('Sanity checks failed:', error.message);
    process.exitCode = 1;
  });
