import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WindPressureView } from './WindPressureView';
import { WindActionsView } from './WindActionsView';

interface WindPageContentProps {
  pressureSectionRef: React.RefObject<HTMLDivElement>;
  actionsSectionRef: React.RefObject<HTMLDivElement>;
}

export function WindPageContent({ pressureSectionRef, actionsSectionRef }: WindPageContentProps) {
  return (
    <ScrollArea className="h-full">
      <div ref={pressureSectionRef} className="p-6 scroll-mt-4">
        <h1 className="text-2xl font-bold mb-2">Wind Pressures</h1>
        <p className="text-sm text-gray-500 m-2">
          Review the level and parameters, go back to previous sections to adjust the inputs as needed. Setup the parameters as per NZS 3604 (and NZS 1170.2 optionally) for calculation the wind pressures. 
        </p>
        <WindPressureView />
      </div>
      <Separator className="my-8" />
      <div ref={actionsSectionRef} className="p-6 scroll-mt-4">
        <h1 className="text-2xl font-bold mb-2">Wind Actions</h1>
          <p className="text-sm text-gray-500 m-2">
          Select the pressures for calculation the wind actions on level. 
        </p>
        <WindActionsView />
      </div>
    </ScrollArea>
  );
}