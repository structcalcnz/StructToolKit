import { useBoundStore } from '@/stores/useBoundStore';
import { EmptyState } from '@/components/common/EmptyState';
import { SectionSummary } from './SectionSummary';
import {MessageSquareWarning} from 'lucide-react';
import {BracingLineCard}  from './BracingLineCard';



export function BracingEditor({ sectionId }: { sectionId: string }) {
  const section = useBoundStore(state => state.sections[sectionId]);
  if (!section) {
    return <EmptyState Icon={MessageSquareWarning} title="Section not found" description="Please select a valid bracing section from the list." />;
  }

  return (
  <div className="h-full w-full overflow-auto p-6">
    <div className='min-w-210 space-y-6'>
        <h1 className="text-2xl font-bold">{section.name}</h1>

        <SectionSummary section={section} />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-2">Bracing Lines</h2>
          
          {section.lines.map((line, index) => (
            <BracingLineCard key={line.id} section={section} line={line} index={index} />
          ))} 
          
        </div>
    </div>
  </div>
  );
}