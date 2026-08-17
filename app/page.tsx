'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TheIdeaSection } from '@/components/TheIdeaSection';
import { BeforeAfterSection } from '@/components/BeforeAfterSection';
import { HowItWorksComic } from '@/components/HowItWorksComic';
import { ExperienceCardsSection } from '@/components/ExperienceCardsSection';
import { FooterCTA } from '@/components/FooterCTA';
import { TestModal } from '@/components/TestModal';
import { SamplePaper } from '@/lib/sample-papers';

export default function Home() {
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [customPaper, setCustomPaper] = useState<SamplePaper | null>(null);

  const handleOpenDemo = (paperId: string = 'calculus-midterm', paper?: SamplePaper) => {
    setActivePaperId(paperId);
    setCustomPaper(paper || null);
  };

  const handleCloseDemo = () => {
    setActivePaperId(null);
    setCustomPaper(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar onOpenDemo={() => handleOpenDemo('calculus-midterm')} />

      <main className="flex-1">
        <HeroSection onPaperReady={(paperId, paper) => handleOpenDemo(paperId, paper)} />
        <TheIdeaSection />
        <BeforeAfterSection />
        <HowItWorksComic />
        <ExperienceCardsSection />
        <FooterCTA onOpenDemo={() => handleOpenDemo('calculus-midterm')} />
      </main>

      <TestModal
        paperId={activePaperId}
        customPaper={customPaper}
        onClose={handleCloseDemo}
      />
    </div>
  );
}
