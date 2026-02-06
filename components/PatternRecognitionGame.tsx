'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Brain } from 'lucide-react';

export function PatternRecognitionGame() {
  const [message, setMessage] = useState('Click Start to begin!');

  const handleStart = () => {
    setMessage('Pattern recognition game will be implemented soon!');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Brain className="w-5 h-5 text-indigo-300" />
        Pattern Recognition
      </h3>
      <p className="text-xs text-zinc-400">Test your memory and pattern recognition skills!</p>
      <Button onClick={handleStart} className="w-full">
        Start Game
      </Button>
      <p className="text-sm text-zinc-400 italic">{message}</p>
    </div>
  );
}
