import { useEffect } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import { BracingSectionList } from './bracing/BracingSectionList';
import { BracingEditor } from './bracing/BracingEditor';
import { EmptyState } from '@/components/common/EmptyState';
import {  MessageSquareWarning  } from 'lucide-react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';


export default function BracingPage() {
  const { activeSectionId, sections } = useBoundStore();
  const generateDefaultSections = useBoundStore(state => state.actions.generateDefaultSections);

  useEffect(() => {
    // Auto-generate sections when the page is first loaded
    generateDefaultSections();
  }, [generateDefaultSections]);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={20} minSize={15}>
        <BracingSectionList />
      </ResizablePanel>
      <ResizableHandle/>
      <ResizablePanel defaultSize={80}>
        {activeSectionId && sections[activeSectionId] ? (
          <BracingEditor sectionId={activeSectionId} />
        ) : (
          <EmptyState Icon={MessageSquareWarning} title="Select a Bracing Section" description="Choose a section from the left to begin the design." />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}