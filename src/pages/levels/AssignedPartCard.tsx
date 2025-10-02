import type { LevelPart } from '@/types';
import { useBoundStore } from '@/stores/useBoundStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge'; 
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';

interface AssignedPartCardProps {
  levelId: string;
  part: LevelPart;
}

export function AssignedPartCard({ levelId, part }: AssignedPartCardProps) {
  const { removePartFromLevel, updateLevelPart } = useBoundStore(state => state.actions);

  const handleUpdate = (updates: Partial<LevelPart>) => {
    updateLevelPart(levelId, part.instanceId, updates);
  };

  return (
    <div className="rounded-md border bg-background mb-2 dark:bg-gray-900">
      {/* Header Row */}
      <div className="px-4 py-2 flex flex-row items-center justify-between">
        <span className="text-base font-medium">{part.name}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removePartFromLevel(levelId, part.instanceId)}
        >
          <Trash2 className="h-4 w-4 text-destructive dark:text-blue-300" />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 py-2 space-y-3">
        {/* Info Row */}
        <div className="flex justify-between items-center text-sm">
          <Badge variant="outline" className="text-amber-600 dark:text-blue-300 border-amber-600 dark:border-blue-300">{part.partType}</Badge>
          <div className="text-right">
            <span className="text-muted-foreground">Base Weight: </span>
            <span className="ml-1 font-semibold">
              {part.baseWeight.toFixed(2)} kPa
            </span>
          </div>
        </div>

        <Separator />

        {/* Conditional Inputs for geometry */}
        {(part.partType === "Floor" || part.partType === "Other") && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label title='The projected area or a user-defined multiplier for a custom "Other" part.'>
                {part.partType === "Floor"
                  ? "Area (m²)"
                  : "Area (m²) / Factor"}
              </Label>
              <Input
                type="number"
                value={part.area || 0}
                onChange={(e) =>
                  handleUpdate({ area: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
        )}

        {part.partType === "Roof" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label title='The projected area of roof'>Area (m²)</Label>
              <Input
                type="number"
                value={part.area || 0}
                onChange={(e) =>
                  handleUpdate({ area: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1">
              <Label title='The average height (typically roof ridge height from eave)'>Average Height (m)</Label>
              <Input
                type="number"
                value={part.height || 0}
                onChange={(e) =>
                  handleUpdate({ height: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
        )}

        {part.partType === "Wall" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label title='Wall length'>Length (m)</Label>
              <Input
                type="number"
                value={part.length || 0}
                onChange={(e) =>
                  handleUpdate({ length: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1">
              <Label title='The average wall height to a floor or eava level'>Height (m)</Label>
              <Input
                type="number"
                value={part.height || 0}
                onChange={(e) =>
                  handleUpdate({ height: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1">
              <Label title='Ratio of total opening area to gross wall area'>Opening Factor</Label>
              <Input
                type="number"
                step={0.1}
                value={part.openingFactor || 1}
                onChange={(e) =>
                  handleUpdate({ openingFactor: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}