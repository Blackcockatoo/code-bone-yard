'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/guardian';
import { Button } from './ui/button';
import { useToast } from './ui/toast';
import { Key, Sparkles, Lock, Unlock, Map, Wrench, Palette, Check, X } from 'lucide-react';
import {
  ALL_KEYS,
  KEYS_BY_TYPE,
  getRecipeText,
  getUnlocksText,
  canCraftKey,
  type Key as KeyType,
  type KeyType as KeyTypeEnum,
} from '@/systems/keys';

const TYPE_ICONS = {
  exploration: Map,
  equipment: Wrench,
  cosmetic: Palette,
};

const TYPE_COLORS = {
  exploration: 'text-emerald-400 border-emerald-600 bg-emerald-500/10',
  equipment: 'text-blue-400 border-blue-600 bg-blue-500/10',
  cosmetic: 'text-purple-400 border-purple-600 bg-purple-500/10',
};

export function KeysPanel() {
  const [selectedType, setSelectedType] = useState<KeyTypeEnum>('exploration');
  const vimana = useStore(s => s.vimana);
  const craftKey = useStore(s => s.craftKey);
  const { toast } = useToast();

  // Get collected sample IDs
  const samplesCollected = useMemo(() => {
    return (vimana.samples || [])
      .filter(s => s.collected)
      .map(s => s.id);
  }, [vimana.samples]);

  // Get crafted key IDs
  const craftedKeyIds = useMemo(() => {
    return vimana.keys?.crafted || [];
  }, [vimana.keys]);

  // Check which keys can be crafted
  const keysWithStatus = useMemo(() => {
    return ALL_KEYS.map(key => {
      const isCrafted = craftedKeyIds.includes(key.id);
      const craftCheck = canCraftKey(key, samplesCollected);

      return {
        ...key,
        isCrafted,
        canCraft: !isCrafted && craftCheck.canCraft,
        missingSamples: craftCheck.missingSamples,
      };
    });
  }, [samplesCollected, craftedKeyIds]);

  const keysByType = useMemo(() => {
    return keysWithStatus.filter(key => key.type === selectedType);
  }, [keysWithStatus, selectedType]);

  const handleCraftKey = (keyId: string) => {
    const keyInfo = keysWithStatus.find(k => k.id === keyId);
    const result = craftKey(keyId);
    if (!result.success) {
      toast({
        title: 'Crafting Failed',
        description: result.error || 'Unable to craft key',
        variant: 'error',
      });
    } else {
      toast({
        title: 'Key Crafted!',
        description: keyInfo ? `${keyInfo.name} has been forged` : 'New key unlocked!',
        variant: 'success',
      });
    }
  };

  const types: KeyTypeEnum[] = ['exploration', 'equipment', 'cosmetic'];

  const craftedCount = craftedKeyIds.length;
  const totalKeys = ALL_KEYS.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-300" />
            Keys System
          </h2>
          <p className="text-xs text-zinc-500">
            Craft keys from samples to unlock hidden content
          </p>
        </div>
        <div className="text-xs text-zinc-400 text-right">
          <p>
            Crafted: <span className="text-emerald-300 font-semibold">{craftedCount}</span>
            /{totalKeys}
          </p>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2">
        {types.map(type => {
          const Icon = TYPE_ICONS[type];
          const count = KEYS_BY_TYPE[type].length;
          const craftedInType = keysWithStatus.filter(k => k.type === type && k.isCrafted).length;

          return (
            <Button
              key={type}
              onClick={() => setSelectedType(type)}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
            >
              <Icon className="w-4 h-4 mr-1" />
              {type}
              <span className="ml-1 text-[10px] opacity-70">
                ({craftedInType}/{count})
              </span>
            </Button>
          );
        })}
      </div>

      {/* Keys Grid */}
      <div className="grid gap-4">
        {keysByType.map(key => (
          <div
            key={key.id}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${key.isCrafted ? 'bg-zinc-800/60' : 'bg-zinc-900/40'}
              ${TYPE_COLORS[key.type]}
            `}
          >
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              {key.isCrafted ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <Check className="w-3 h-3" />
                  Crafted
                </div>
              ) : key.canCraft ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Available
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-500/20 text-zinc-400 text-xs font-semibold">
                  <Lock className="w-3 h-3" />
                  Locked
                </div>
              )}
            </div>

            {/* Key Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${key.isCrafted ? 'bg-zinc-700/60' : 'bg-zinc-800/40'}
              `}>
                {key.isCrafted ? (
                  <Unlock className="w-6 h-6 text-amber-300" />
                ) : (
                  <Lock className="w-6 h-6 text-zinc-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{key.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{key.description}</p>
                {key.lore && (
                  <p className="text-[10px] text-zinc-500 italic mt-1">"{key.lore}"</p>
                )}
              </div>
            </div>

            {/* Recipe Section */}
            <div className="mt-3 pt-3 border-t border-zinc-700/50">
              <h4 className="text-xs font-semibold text-zinc-300 mb-2">Recipe:</h4>
              <p className="text-xs text-zinc-400">{getRecipeText(key)}</p>

              {/* Missing Samples */}
              {!key.isCrafted && key.missingSamples.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {key.missingSamples.map((missing, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 text-[10px] border border-red-500/20"
                    >
                      <X className="w-3 h-3 inline mr-0.5" />
                      Need {missing.count} {missing.rarity}
                      {missing.biome ? ` from ${missing.biome}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Unlocks Section */}
            <div className="mt-3 pt-3 border-t border-zinc-700/50">
              <h4 className="text-xs font-semibold text-zinc-300 mb-2">Unlocks:</h4>
              <ul className="space-y-1">
                {getUnlocksText(key).map((unlock, idx) => (
                  <li key={idx} className="text-xs text-zinc-400 flex items-start gap-1">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    {unlock}
                  </li>
                ))}
              </ul>
            </div>

            {/* Craft Button */}
            {!key.isCrafted && (
              <div className="mt-4">
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!key.canCraft}
                  onClick={() => handleCraftKey(key.id)}
                >
                  {key.canCraft ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Craft Key
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-1" />
                      Insufficient Samples
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Section */}
      {craftedCount > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <h3 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-2">
            <Unlock className="w-4 h-4" />
            Active Key Benefits
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {vimana.keys?.unlockedLocations?.length > 0 && (
              <div className="text-zinc-400">
                <span className="text-emerald-300 font-semibold">{vimana.keys.unlockedLocations.length}</span>
                {' '}Hidden Locations
              </div>
            )}
            {vimana.keys?.unlockedEquipment?.length > 0 && (
              <div className="text-zinc-400">
                <span className="text-blue-300 font-semibold">{vimana.keys.unlockedEquipment.length}</span>
                {' '}Equipment Pieces
              </div>
            )}
            {vimana.keys?.unlockedCosmetics?.length > 0 && (
              <div className="text-zinc-400">
                <span className="text-purple-300 font-semibold">{vimana.keys.unlockedCosmetics.length}</span>
                {' '}Cosmetics
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
