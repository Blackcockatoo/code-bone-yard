import React, { useState, useMemo } from 'react';
import { Offspring } from '../auralia/persistence';
import { Genome, calculateResonance, breed } from '../auralia/breeding';

interface BreedingCenterProps {
  currentPetName: string;
  currentPetGenome: Genome;
  offspring: Offspring[];
  bond: number;
  onBreed: (child: Offspring) => void;
  prng: () => number;
}

export const BreedingCenter: React.FC<BreedingCenterProps> = ({
  currentPetName,
  currentPetGenome,
  offspring,
  bond,
  onBreed,
  prng,
}) => {
  const [partnerName, setPartnerName] = useState('');
  const [selectedOffspringIndex, setSelectedOffspringIndex] = useState<number | null>(null);

  const partnerGenome = useMemo(() => {
    if (selectedOffspringIndex !== null) {
      return offspring[selectedOffspringIndex].genome;
    }
    // For external partners, we'd normally need a way to get their genome.
    // For now, let's assume external partners have a random-ish genome based on their name.
    return null; 
  }, [selectedOffspringIndex, offspring]);

  const resonance = useMemo(() => {
    if (partnerGenome) {
      return calculateResonance(currentPetGenome, partnerGenome);
    }
    return null;
  }, [currentPetGenome, partnerGenome]);

  const handleBreed = () => {
    if (selectedOffspringIndex !== null) {
      const partner = offspring[selectedOffspringIndex];
      const child = breed(currentPetName, currentPetGenome, partner.name, partner.genome, prng);
      onBreed(child);
    }
  };

  return (
    <div className="p-6 bg-gray-900/80 rounded-2xl border border-purple-500/30 backdrop-blur-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        Breeding Center
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Pet Info */}
        <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-semibold mb-2">Current Guardian</h3>
          <p className="text-purple-300 font-mono">{currentPetName}</p>
          <div className="mt-2 space-y-1 text-xs opacity-70">
            <p>Red: {currentPetGenome.red60.toFixed(1)}</p>
            <p>Blue: {currentPetGenome.blue60.toFixed(1)}</p>
            <p>Black: {currentPetGenome.black60.toFixed(1)}</p>
          </div>
        </div>

        {/* Partner Selection */}
        <div className="p-4 bg-pink-900/20 rounded-xl border border-pink-500/20">
          <h3 className="text-lg font-semibold mb-2">Select Partner</h3>
          {offspring.length > 0 ? (
            <select
              className="w-full bg-gray-800 border border-pink-500/30 rounded p-2 text-sm"
              onChange={(e) => setSelectedOffspringIndex(parseInt(e.target.value))}
              value={selectedOffspringIndex ?? ''}
            >
              <option value="" disabled>Choose from lineage...</option>
              {offspring.map((child, i) => (
                <option key={i} value={i}>{child.name}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-400 italic">No offspring available yet.</p>
          )}
          
          {partnerGenome && (
            <div className="mt-2 space-y-1 text-xs opacity-70">
              <p>Red: {partnerGenome.red60.toFixed(1)}</p>
              <p>Blue: {partnerGenome.blue60.toFixed(1)}</p>
              <p>Black: {partnerGenome.black60.toFixed(1)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Resonance & Action */}
      <div className="mt-6 flex flex-col items-center">
        {resonance !== null && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-400">Genetic Resonance</p>
            <p className={`text-3xl font-bold ${resonance > 80 ? 'text-green-400' : resonance > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {resonance.toFixed(1)}%
            </p>
          </div>
        )}

        <button
          onClick={handleBreed}
          disabled={bond < 70 || selectedOffspringIndex === null}
          className={`px-8 py-3 rounded-full font-bold transition-all ${
            bond >= 70 && selectedOffspringIndex !== null
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-lg shadow-purple-500/20'
              : 'bg-gray-700 cursor-not-allowed opacity-50'
          }`}
        >
          {bond < 70 ? `Need ${70 - bond} more Bond` : 'Initiate Breeding'}
        </button>
        <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest">
          Consumes 50 Energy
        </p>
      </div>
    </div>
  );
};
