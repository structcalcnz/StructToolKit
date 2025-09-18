import { useMemo } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import type { BracingSection } from '@/types';
import { calculateSectionAchievedBUs } from '@/lib/bracingCalculationUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SectionSummary({ section }: { section: BracingSection }) {
  const { bracingSystems } = useBoundStore();
  const { updateSectionDetails, resetSectionDemands } = useBoundStore(state => state.actions);

  // Memoized calculation for achieved BUs
  const { achievedWind, achievedEQ } = useMemo(() => {
    return calculateSectionAchievedBUs(section, bracingSystems);
  }, [section, bracingSystems]);

  const windRate = section.demandWind > 0 ? (achievedWind / section.demandWind) * 100 : 0;
  const eqRate = section.demandEQ > 0 ? (achievedEQ / section.demandEQ) * 100 : 0;

  const getRateColor = (rate: number) => {
    if (rate < 100) return "bg-red-100 text-red-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <Card>
      <CardHeader><CardTitle>Section Summary</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- Left Side: Inputs --- */}
        <div className="mt-2 space-y-4 p-4">
          <div className="grid grid-cols-4 items-center">
            <Label className="text-right">Level</Label>
            <Input value={section.name.split(' - ')[0]} disabled className="col-span-2" />
          </div>
          <div className="grid grid-cols-4 items-center">
            <Label className="text-right">Direction</Label>
            <Input value={section.direction} disabled className="col-span-2" />
          </div>
          <div className="grid grid-cols-4 items-center">
            <Label className="text-right">Floor Type</Label>
            <Select
              value={section.floorType}
              onValueChange={(value: 'Timber' | 'Concrete') => updateSectionDetails(section.id, { floorType: value })}
            >
              <SelectTrigger className="col-span-2 min-w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Timber">Timber</SelectItem>
                <SelectItem value="Concrete">Concrete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --- Right Side: Results --- */}
        <div className="w-full grid grid-cols-[1fr_1fr_1fr_auto] gap-x-4 gap-y-2 text-sm p-4 border rounded-md">
          <div></div>
          <div className="font-bold text-center">Wind</div>
          <div className="font-bold text-center">EQ</div>
          <div></div>

          <div className="font-semibold text-right my-auto">Demand BUs</div>
          <div className="flex items-center">
            <Input type="number" value={section.demandWind} onChange={e => updateSectionDetails(section.id, { demandWind: Number(e.target.value) })} className="text-center h-8" />
          </div>
          <div className="flex items-center">
            <Input type="number" value={section.demandEQ} onChange={e => updateSectionDetails(section.id, { demandEQ: Number(e.target.value) })} className="text-center h-8" />
          </div>
          <div className="flex items-center">
            <Button title="Reset to the calculated values" variant="ghost" size="icon" className="h-6 w-6" onClick={() => resetSectionDemands(section.id)}><RefreshCw className="h-4 w-4 text-lime-600" /></Button>
          </div>
          <div className="font-semibold text-right my-auto">Achieved BUs</div>
          <div className="flex items-center justify-center bg-muted rounded-md p-1 min-h-[32px]">{achievedWind.toFixed(0)}</div>
          <div className="flex items-center justify-center bg-muted rounded-md p-1 min-h-[32px]">{achievedEQ.toFixed(0)}</div>
          <div></div>
          <div className="font-semibold text-right my-auto">Rate</div>
          <div className={cn("flex items-center justify-center font-bold rounded-md p-1 min-h-[32px]", getRateColor(windRate))}>
            {windRate.toFixed(1)}%
          </div>
          <div className={cn("flex items-center justify-center font-bold rounded-md p-1 min-h-[32px]", getRateColor(eqRate))}>
            {eqRate.toFixed(1)}%
          </div>
        </div>

      </CardContent>
    </Card>
  );
}