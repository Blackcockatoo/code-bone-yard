'use client';

import AuraliaMetaPet from '@/components/AuraliaMetaPet';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PetPage() {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden relative">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-700 bg-slate-900/80 text-zinc-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Main Pet Display - Full Screen */}
      <div className="w-full h-full">
        <AuraliaMetaPet />
      </div>
    </div>
  );
}
