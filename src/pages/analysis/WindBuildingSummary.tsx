import { useMemo } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function WindBuildingSummary() {
  const { levels, windInputs } = useBoundStore();
  const { updateWindInput } = useBoundStore(state => state.actions);

  const buildingDims = useMemo(() => {
    const allLevels = Object.values(levels);
    if (allLevels.length === 0) {
      return { h: 0, ns_min: 0, ns_max: 0, ew_min: 0, ew_max: 0 };
    }
    const nsDims = allLevels.map(l => l.planDimNS);
    const ewDims = allLevels.map(l => l.planDimEW);

    return {
      h: allLevels.reduce((sum, l) => sum + l.storeyHeight, 0),
      ns_min: Math.min(...nsDims),
      ns_max: Math.max(...nsDims),
      ew_min: Math.min(...ewDims),
      ew_max: Math.max(...ewDims),
    };
  }, [levels]);

  const hasLevels = Object.keys(levels).length > 0;

  return (
    <Card>
      <CardHeader><CardTitle>Building Summary & Design Method</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {hasLevels ? (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-end">
          <div className="space-y-1">
            <Label>Building Height, h (m)</Label>
            <Input value={buildingDims.h.toFixed(2)} readOnly disabled />
          </div>
          <div className="space-y-1">
            <Label>NS Dims (min/max)</Label>
            <Input value={`${buildingDims.ns_min.toFixed(2)} / ${buildingDims.ns_max.toFixed(2)}`} readOnly disabled />
          </div>
          <div className="space-y-1">
            <Label>EW Dims (min/max)</Label>
            <Input value={`${buildingDims.ew_min.toFixed(2)} / ${buildingDims.ew_max.toFixed(2)}`} readOnly disabled />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="is-ns-gable" checked={windInputs.isNSGable} onCheckedChange={c => updateWindInput('isNSGable', Boolean(c))} />
            <Label htmlFor="is-ns-gable">NS Wind on Gable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-ew-gable" checked={windInputs.isEWGable} onCheckedChange={c => updateWindInput('isEWGable', Boolean(c))} />
            <Label htmlFor="is-ew-gable">EW Wind on Gable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="use-1170" checked={windInputs.useNZS1170} onCheckedChange={c => updateWindInput('useNZS1170', Boolean(c))} />
            <Label htmlFor="use-1170" className="font-semibold">Design as per NZS 1170.2</Label>
          </div>
        </div>
        </> ) : (
          // NEW: Empty state message when there are no levels
          <p className="text-sm text-center text-muted-foreground py-8">
            Building dimensions will be calculated here once levels are defined.
          </p>
        )}
      </CardContent>
    </Card>
  );
}