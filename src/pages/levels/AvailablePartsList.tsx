import { useBoundStore } from '@/stores/useBoundStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlusCircle } from 'lucide-react';

export function AvailablePartsList() {
  const { parts, predefinedLevelParts, activeLevelId } = useBoundStore();
  const { addPartToLevel, addPredefinedPartToLevel } = useBoundStore(state => state.actions);

return (
  <div className="flex flex-col h-full bg-muted/40 border-l">
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold">Available Parts</h2>
    </div>
    <ScrollArea className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Custom Parts */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Custom Built Parts</h3>
          <div className="space-y-2">
            {Object.values(parts).map(part => (
              <div
                key={part.id}
                onClick={() => activeLevelId && addPartToLevel(activeLevelId, part.id)}
                className="flex items-center justify-between rounded-md border bg-background p-3 cursor-pointer hover:bg-accent transition dark:bg-gray-900"
              >
                <span className="text-sm font-medium">{part.name}</span>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Predefined Parts */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Predefined Parts</h3>
          <div className="space-y-2">
            {predefinedLevelParts.map(p => (
              <div
                key={p.name}
                onClick={() => activeLevelId && addPredefinedPartToLevel(activeLevelId, p)}
                className="flex items-center justify-between rounded-md border bg-background p-3 cursor-pointer hover:bg-accent transition dark:bg-gray-900"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  </div>
)
}