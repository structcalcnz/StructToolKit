import { useEffect, useMemo } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import windLookups from '@/data/windLookups.json';

export function WindNZS3604() {
  const { levels, levelOrder, windInputs, windCalculatedFactors } = useBoundStore();
  const { updateWindInput, calculateWindFactors } = useBoundStore(state => state.actions);

  // Memoize the calculation for top-level roof height
  const avgTopRoofHeight = useMemo(() => {
    const topLevelId = [...levelOrder].reverse()[0];
    const topLevel = levels[topLevelId];
    if (!topLevel) return 0;

    const roofParts = topLevel.parts.filter(p => p.partType === 'Roof');
    if (roofParts.length === 0) return 0;

    const totalRoofArea = roofParts.reduce((sum, p) => sum + (p.area || 0), 0);
    if (totalRoofArea === 0) return 0;

    const weightedHeightSum = roofParts.reduce((sum, p) => sum + (p.height || 0) * (p.area || 0), 0);
    return weightedHeightSum / totalRoofArea;
  }, [levels, levelOrder]);

  // Auto-recalculate pressures whenever a relevant input changes
  useEffect(() => {
    calculateWindFactors();
  }, [windInputs.nzs3604Zone, avgTopRoofHeight, calculateWindFactors]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 items-end">
      <div className="space-y-1">
        <Label>Site Wind Zone</Label>
        <Select
          value={windInputs.nzs3604Zone}
          onValueChange={(value: keyof typeof windLookups.nzs3604.zones) => updateWindInput('nzs3604Zone', value)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(windLookups.nzs3604.zones).map(zone => (
              <SelectItem key={zone} value={zone}>{zone}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>p/Cfig (kPa)</Label>
        <Input value={windCalculatedFactors.nzs3604_p_cfig?.toFixed(2) || '...'} readOnly disabled />
      </div>
      
      <div className="space-y-1">
        <Label title={`Calculated from avg. roof height of ${avgTopRoofHeight.toFixed(2)}m`}>
          Cpe,r,h
        </Label>
        <Input value={windCalculatedFactors.nzs3604_cperh?.toFixed(2) || '...'} readOnly disabled />
      </div>
      
      <div className="space-y-1">
        <Label>Cpe,w</Label>
        <Input value="1.20" readOnly disabled />
      </div>

      <div className="space-y-1 font-semibold md:col-span-2">
        <Label>Pressure on Roof, pr (kPa)</Label>
        <Input value={windCalculatedFactors.nzs3604_pr?.toFixed(3) || '...'} readOnly disabled className="font-bold text-base h-10" />
      </div>

      <div className="space-y-1 font-semibold md:col-span-2">
        <Label>Pressure on Wall, pw (kPa)</Label>
        <Input value={windCalculatedFactors.nzs3604_pw?.toFixed(3) || '...'} readOnly disabled className="font-bold text-base h-10" />
      </div>
    </div>
  );
}