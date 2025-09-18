import { useBoundStore } from '@/stores/useBoundStore';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { EmptyState } from '@/components/common/EmptyState';
import { GanttChartSquare, Layers } from 'lucide-react';
import { LevelsList } from './levels/LevelsList';
import { AvailablePartsList } from './levels/AvailablePartsList';
import { AssignedPartCard } from './levels/AssignedPartCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Main Editor Component for the active level
function LevelEditor({ levelId }: { levelId: string }) {
  const level = useBoundStore(state => state.levels[levelId]);
  const { updateLevelDetails } = useBoundStore(state => state.actions);

  if (!level) return <EmptyState Icon={GanttChartSquare} title="Level Not Found" description="Please select a valid level." />;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-2">
          <Card>
            <CardContent className="px-4 space-y-2">
              {/* top section */}
              <h1 className="text-2xl font-bold">{level.name}</h1>
              <div className="p-1 flex flex-row items-center justify-between">
                <div className="flex flex-row gap-4">
                    <Label className="text-muted-foreground">Total Floor/Roof Area</Label>
                    <p className="font-semibold text-amber-600 dark:text-blue-300">{level.totalArea.toFixed(2)} m²</p>
                </div>
                <div className="flex flex-row gap-4">
                    <Label className="text-muted-foreground">Total Level Weight</Label>
                    <p className="font-semibold text-amber-600 dark:text-blue-300">{level.totalLevelWeight.toFixed(2)} kN</p>
                </div>
              </div>
              <Separator />
              {/* General inputs below */}
              <div className="grid grid-cols-3 gap-4 p-1">
                <div className="space-y-1">
                  <Label title='Inter-storey height between levels'>Storey Height (m)</Label>
                  <Input type="number" value={level.storeyHeight} onChange={e => updateLevelDetails(level.id, { storeyHeight: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label title="The building's plan dimension along the North-South axis">Plan Dim (N-S) (m)</Label>
                  <Input type="number" value={level.planDimNS} onChange={e => updateLevelDetails(level.id, { planDimNS: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label title="The building's plan dimension along the East-West axis">Plan Dim (E-W) (m)</Label>
                  <Input type="number" value={level.planDimEW} onChange={e => updateLevelDetails(level.id, { planDimEW: parseFloat(e.target.value) })} />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-2">
             <h2 className="text-lg font-semibold px-2">Assigned Parts</h2>
             {level.parts.length > 0 ? (
                level.parts.map(part => (
                    <AssignedPartCard key={part.instanceId} levelId={level.id} part={part} />
                ))
             ) : (
                <p className="text-sm text-center text-muted-foreground p-4">No parts assigned. Add some from the "Available Parts" list.</p>
             )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function LevelsPage() {
  const activeLevelId = useBoundStore(state => state.activeLevelId);
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={20} minSize={15}>
        <LevelsList />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={55} minSize={30}>
        {activeLevelId ? (
          <LevelEditor levelId={activeLevelId} />
        ) : (
          <EmptyState Icon={Layers} title="No Level Selected" description="Select a level from the list on the left, or create a new one to begin." />
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <AvailablePartsList />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}