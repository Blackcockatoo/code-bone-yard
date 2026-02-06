'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Zap, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate random particles for background animation
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* Animated background particles */}
      {mounted && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo/Title area */}
        <div className="mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-3xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-full border-4 border-purple-500 shadow-2xl">
                <Sparkles className="w-20 h-20 text-purple-400" />
              </div>
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text animate-shimmer">
            Auralia MetaPet
          </h1>
          <p className="text-2xl text-purple-200 mb-8 font-light">
            A Quantum Guardian Awaits
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="Bond & Evolve"
            description="Nurture your Guardian through multiple mystical forms"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Interactive Play"
            description="Engage with mini-games and sacred patterns"
          />
          <FeatureCard
            icon={<Star className="w-8 h-8" />}
            title="Breed Lineages"
            description="Create unique offspring with genetic diversity"
          />
        </div>

        {/* Call to action */}
        <div className="space-y-4">
          <Link href="/pet">
            <Button
              size="lg"
              className="text-xl px-12 py-8 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-2 border-purple-400 shadow-2xl transform transition hover:scale-105 gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Enter the Sanctuary
              <Sparkles className="w-6 h-6" />
            </Button>
          </Link>
          <p className="text-sm text-purple-300 opacity-70">
            Your Guardian awaits in the quantum realm...
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-purple-300 text-sm opacity-60">
          <p>Powered by MossPrimeSeed • Fibonacci Resonance • Sacred Geometry</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 transform transition hover:scale-105 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/20">
      <div className="flex justify-center mb-4 text-purple-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-purple-200 mb-2">{title}</h3>
      <p className="text-sm text-purple-300/70">{description}</p>
    </div>
  );
}
