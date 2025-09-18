
import { useBoundStore } from '@/stores/useBoundStore';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { EmptyState } from '@/components/common/EmptyState';
import { FileCog, Package } from 'lucide-react';

// Import the new sub-components
import { PartsList } from './parts/PartsList';
import { ComponentLibrary } from './parts/ComponentLibrary';
import { LayerCard } from './parts/LayerCard'; // You would create this component based on your old LayerBlock
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
//import { Checkbox } from '@/components/ui/checkbox';

// Main Editor Component
function PartEditor({ partId }: { partId: string }) {
  const part = useBoundStore(state => state.parts[partId]);
  //const updateRoofSlope = useBoundStore(state => state.actions);
  const {updatePart} = useBoundStore(state => state.actions);

  if (!part) return null; // Should not happen if partId is valid

  const isSlopedType = part.partType === 'Roof' || part.partType === 'Floor';

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <h1 className="text-xl font-bold">{part.name}</h1>
        <Separator />
        {/* New layout row */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-row space-x-2">
            <Label>Part Type</Label>
            <Select value={part.partType} onValueChange={(v: 'Wall' | 'Floor' | 'Roof' | 'Other') => updatePart(part.id, { partType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Wall">Wall</SelectItem>
                <SelectItem value="Floor">Floor</SelectItem>
                <SelectItem value="Roof">Roof</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
            {/* Slope controls are now conditional */}
            {isSlopedType && (
              <div className="flex flex-row space-x-2">
                <Label>Slope</Label>
                <div className="flex items-center">
                    <Input
                        type="number"
                        value={part.roofSlope ?? 0}
                        onChange={e => updatePart(part.id, { roofSlope: parseFloat(e.target.value) || 0 })}
                        className="w-18 text-right"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">°</span>
                </div>
              </div>
            )}
        </div>
      </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
          {part.layers.length > 0 ? (
            part.layers.map((layer, index) => (
              <LayerCard key={layer.id} layer={layer} partId={part.id} index={index} totalLayers={part.layers.length} />
            ))
          ) : (
              <EmptyState Icon={Package} title="Empty Part" description="Add layers from the Component Library on the right to build this part." />
          )}
        </div>
        <div className="p-4 border-t text-right bg-background dark:bg-gray-900">
          <p className="text-sm">Total Weight:</p>
          <p className="text-2xl font-bold text-primary">{part.totalWeight.toFixed(3)} kPa</p>
        </div>
    </div>
  );
}


export default function PartsPage() {
  const { activePartId, parts } = useBoundStore();

  const hasParts = Object.keys(parts).length > 0;

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={20} minSize={15}>
        <PartsList />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={55} minSize={30}>
        {activePartId && parts[activePartId] ? (
            <PartEditor partId={activePartId} />
        ) : (
            <div className="h-full">
                 <EmptyState
                    Icon={FileCog}
                    title={hasParts ? "Select a Part" : "No Parts Created"}
                    description={hasParts ? "Select a part from the list on the left to view and edit its layers." : "Use the '+' button in the 'Building Parts' panel to create your first part."}
                />
            </div>
        )}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <ComponentLibrary />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}