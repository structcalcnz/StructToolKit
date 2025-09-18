import type { SeismicPartInstance } from '@/types';
import { useBoundStore } from '@/stores/useBoundStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SeismicPartCard({ instance }: { instance: SeismicPartInstance }) {
  const { updateSeismicInstanceParam } = useBoundStore(state => state.actions);
  const isWallType = instance.partType === 'Wall'
  const isPartition = instance.partType === 'Other' && instance.name.toLowerCase().includes('partition');
  const isFloorType = instance.partType === 'Floor';

  // Using divs for a denser, row-like view
  return (
    <div className="border-b p-3 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 items-end">
      {/* Column 1: Name and Geometry */}
      <div className="space-y-1 col-span-2 md:col-span-1">
        <p className="font-medium text-sm">{instance.name}</p>
        <p className="text-xs text-muted-foreground">
          {isWallType
            ? `L: ${instance.length || 0}m, H: ${instance.height || 0}m, FO: ${instance.openingFactor || 1}`
            : instance.partType === 'Other' && !instance.name.toLowerCase().includes('partition')? `Area/factor: ${instance.area || 0} (m²)` : `Area: ${instance.area || 0}m²`
          }
        </p>
      </div>
      
      {/* Column 2: Loads */}
      <div className="space-y-1">
        <Label className="text-xs">DL (kPa)</Label>
        <Input value={instance.baseWeight.toFixed(2)} readOnly disabled />
      </div>
      
      {/* Column 3: Live Load / Wall Factor */}
      <div className="space-y-1">
        {isWallType || isPartition ? (
          <>
            <Label className="text-xs">Height Factor</Label>
            <Input
              type="number" step={0.1}
              value={instance.heightFactor.toFixed(2)}
              onChange={e => updateSeismicInstanceParam(instance.instanceId, 'heightFactor', parseFloat(e.target.value))}
            />
          </>
        ) : (
          <>
            <Label className="text-xs">LL (kPa)</Label>
            <Input
              type="number" step={0.5}
              value={((instance.liveLoad ?? 0).toFixed(2)) || 0}
              readOnly={!isFloorType}
              disabled={!isFloorType}
              onChange={e => isFloorType && updateSeismicInstanceParam(instance.instanceId, 'liveLoad', parseFloat(e.target.value) || 0)}
            />
          </>
        )}
      </div>

      {/* Column 4: LL Factor */}
      <div className="space-y-1">
        {isFloorType && (
          <>
            <Label className="text-xs">Live Load Factor (Φe)</Label>
            <Select
              value={String(instance.phi_e)}
              onValueChange={v => updateSeismicInstanceParam(instance.instanceId, 'phi_e', parseFloat(v))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.3">0.3 (Standard)</SelectItem>
                <SelectItem value="0.6">0.6 (Storage)</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>
    </div>
  );
}