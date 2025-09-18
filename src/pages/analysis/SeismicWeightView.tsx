import { useBoundStore } from '@/stores/useBoundStore';
import { SeismicPartCard } from './SeismicPartCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/common/EmptyState';
import { AlertTriangle, Weight  } from 'lucide-react';


export function SeismicWeightView() {
  const { levels, levelOrder, seismicInstances, seismicLevelResults, applyAreaFactor, isWeightResultsStale } = useBoundStore();
  const { calculateSeismicWeights, toggleApplyAreaFactor } = useBoundStore(state => state.actions);

  //  Empty state check
  if (Object.keys(seismicInstances).length === 0) {
    return (
      <EmptyState
        Icon={Weight}
        title="No Data to Analyze"
        description="There are no parts assigned to levels. Please go to the 'Levels' page to build your model before calculating seismic weights."
      />
    );
  }

  const reversedLevelOrder = [...levelOrder].reverse();

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={levelOrder} className="w-full">
        {reversedLevelOrder.map(levelId => {
          const level = levels[levelId];
          const instancesOnLevel = Object.values(seismicInstances).filter(inst => inst.levelId === levelId);
          if (!level) return null;

          return (
            <AccordionItem value={levelId} key={levelId}>
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex justify-between w-full pr-4 items-center">
                    <span>{level.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                        H: {level.storeyHeight.toFixed(2)}m
                   </span>
                </div></AccordionTrigger>
              <AccordionContent className="pt-2">
                {/* The dense cards will be rendered here */}
                <div className="rounded-md">
                    {instancesOnLevel.map(inst => <SeismicPartCard key={inst.instanceId} instance={inst} />)}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Seismic Weight Summary</CardTitle>
            <div className="flex items-center gap-4">
              {/* Checkbox for phi_a */}
              <div className="flex items-center space-x-2">
                <Checkbox id="area-factor" checked={applyAreaFactor} onCheckedChange={(checked) => toggleApplyAreaFactor(Boolean(checked))} />
                <Label htmlFor="area-factor" className="text-sm font-normal">Apply LL Area Factor</Label>
              </div>
              <Button onClick={calculateSeismicWeights} variant={isWeightResultsStale ? "destructive" : "outline" }>Calculate Weights</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* conditional alert notice */}
            {isWeightResultsStale && (Object.keys(seismicLevelResults).length > 0) && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Results are Outdated</AlertTitle>
                    <AlertDescription>
                        An input parameter has changed. Please recalculate to see the updated seismic weights.
                    </AlertDescription>
                </Alert>
            )}
            {reversedLevelOrder.map(levelId => {
              const result = seismicLevelResults[levelId];
              const level = levels[levelId];
              if (!result || !level) return <p key={levelId} className="text-sm text-muted-foreground p-2">{level?.name || 'Level'}: Awaiting calculation...</p>;
              return (
                <div key={levelId} className="grid grid-cols-3 gap-4 text-sm p-2 border-b last:border-b-0">
                  <span className="font-medium">{level.name}</span>
                  <span>Effective DL (kN): <span className="font-mono">{result.effectiveDL.toFixed(2)}</span></span>
                  <span>Effective LL (kN): <span className="font-mono">{result.effectiveLL.toFixed(2)}</span></span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}