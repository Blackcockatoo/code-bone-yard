/**
 * Equipment Panel Component
 * Displays and manages scanner/toolkit equipment
 */

'use client';

import { ScannerType, ToolkitType } from '@/systems/exploration/types';
import {
  ALL_EQUIPMENT,
  getEquipment,
  getEquipmentEffectsSummary,
  getAvailableEquipment,
  canAffordEquipment,
  getEquipmentUnlockHint,
} from '@/systems/exploration/progression';
import { Scan, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EquipmentPanelProps {
  scanner: ScannerType;
  toolkit: ToolkitType;
  scanLevel: number;
  ownedEquipment: string[];
  onEquip: (equipmentId: ScannerType | ToolkitType, type: 'scanner' | 'toolkit') => void;
  onPurchase?: (equipmentId: ScannerType | ToolkitType) => void;
  state?: {
    curiosity: number;
    samplesCollected: string[];
  };
}

export function EquipmentPanel({
  scanner,
  toolkit,
  scanLevel,
  ownedEquipment,
  onEquip,
  onPurchase,
  state,
}: EquipmentPanelProps) {
  const effects = getEquipmentEffectsSummary(scanner, toolkit);
  const currentScanner = getEquipment(scanner);
  const currentToolkit = getEquipment(toolkit);

  const availableForPurchase = state
    ? getAvailableEquipment(scanLevel, ownedEquipment)
    : [];

  return (
    <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-teal-300" />
        <h3 className="text-sm font-semibold text-white">Equipment</h3>
      </div>

      {/* Current Equipment */}
      <div className="grid grid-cols-2 gap-3">
        {/* Scanner */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Scan className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white">Scanner</span>
          </div>
          {currentScanner && (
            <>
              <div className="text-sm font-semibold text-blue-300">
                {currentScanner.name}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">
                {currentScanner.description}
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-[10px] text-zinc-300">
                  Range: {effects.scanRange} tiles
                </div>
                {effects.rareSpawnBonus > 0 && (
                  <div className="text-[10px] text-amber-400">
                    +{effects.rareSpawnBonus}% rare spawn
                  </div>
                )}
                {effects.revealHiddenLocations && (
                  <div className="text-[10px] text-purple-400">
                    Reveals hidden locations
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Toolkit */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-white">Toolkit</span>
          </div>
          {currentToolkit && (
            <>
              <div className="text-sm font-semibold text-green-300">
                {currentToolkit.name}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">
                {currentToolkit.description}
              </div>
              <div className="mt-2 space-y-1">
                {effects.healthDamageReduction > 0 && (
                  <div className="text-[10px] text-green-400">
                    -{effects.healthDamageReduction}% health damage
                  </div>
                )}
                {effects.energyCapacity > 100 && (
                  <div className="text-[10px] text-blue-400">
                    +{effects.energyCapacity - 100} energy cap
                  </div>
                )}
                {effects.xpBonus > 0 && (
                  <div className="text-[10px] text-purple-400">
                    +{effects.xpBonus}% XP gain
                  </div>
                )}
                {effects.debuffImmunity && (
                  <div className="text-[10px] text-amber-400">
                    Debuff immunity
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Available for Purchase */}
      {onPurchase && state && availableForPurchase.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white">Available Upgrades</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableForPurchase.map((equipment) => {
              const affordCheck = canAffordEquipment(equipment, state);
              return (
                <div
                  key={equipment.id}
                  className="bg-slate-800/30 rounded-lg p-2 border border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white">
                        {equipment.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        {equipment.description}
                      </div>
                      <div className="text-[10px] text-amber-400 mt-1">
                        {getEquipmentUnlockHint(equipment)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={affordCheck.canAfford ? 'default' : 'outline'}
                      disabled={!affordCheck.canAfford}
                      onClick={() => onPurchase(equipment.id as ScannerType | ToolkitType)}
                      className="ml-2"
                    >
                      {affordCheck.canAfford ? 'Buy' : <Lock className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
