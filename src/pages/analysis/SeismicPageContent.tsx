import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SeismicWeightView } from './SeismicWeightView';
import { SeismicDesignView } from './SeismicDesignView';

interface SeismicPageContentProps {
  weightSectionRef: React.RefObject<HTMLDivElement>;
  designSectionRef: React.RefObject<HTMLDivElement>;
}

export function SeismicPageContent({ weightSectionRef, designSectionRef }: SeismicPageContentProps) {
  return (
    // The ScrollArea is crucial for containing the scroll behavior to this panel
    <ScrollArea className="h-full">
      {/* Section 1: Seismic Weight */}
      <div ref={weightSectionRef} className="p-6 scroll-mt-4"> {/* scroll-mt adds top margin on scroll */}
        <h1 className="text-2xl font-bold mb-4">Seismic Weight</h1>
        <p className="text-sm text-gray-500">
          Review the level, contents and parameters for calculation the seismic weights. Go back to previous sections to adjust the inputs as needed.
        </p>
        <SeismicWeightView />
      </div>

      <Separator className="my-8" />

      {/* Section 2: Seismic Design */}
      <div ref={designSectionRef} className="p-6 scroll-mt-4">
        <h1 className="text-2xl font-bold mb-4">Seismic Design</h1>
        <p className="text-sm text-gray-500 mb-4">
          Input the parameters as per NZS1170.5 for calculation the seismic actions.
        </p>
        <SeismicDesignView />
      </div>
    </ScrollArea>
  );
}