import { useBoundStore } from '@/stores/useBoundStore';
import { WindActionsTable } from './WindActionsTable';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; 
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert
import { AlertTriangle } from 'lucide-react'; // Import Icon
import { cn } from '@/lib/utils';

export function WindActionsView() {
  const { windInputs, windActionsNS, windActionsEW, isWindResultsStale } = useBoundStore();
  const { updateWindInput, calculateWindActions } = useBoundStore(state => state.actions);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <CardTitle>Wind Actions</CardTitle>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>Pressure Source</Label>
              <Select value={windInputs.pressureSource} onValueChange={(v) => updateWindInput('pressureSource', v)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NZS3604">Use NZS 3604</SelectItem>
                  {windInputs.useNZS1170 && <SelectItem value="NZS1170">Use NZS 1170.2</SelectItem>}
                  {windInputs.useNZS1170 && <SelectItem value="Max">Use Max Value</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 ml-3 mr-3">
              <Label>Comb. Factor, Kc</Label>
              <Input
                type="number" step={0.1}
                value={windInputs.kc}
                onChange={e => updateWindInput('kc', parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
            <Button
              onClick={calculateWindActions}
              variant={isWindResultsStale ? "destructive" : "default"}
              className={cn(isWindResultsStale && 'animate-pulse')}
            >
              {isWindResultsStale ? 'Recalculate Actions' : 'Calculate Actions'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isWindResultsStale && windActionsNS.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Results are Outdated</AlertTitle>
            <AlertDescription>
              A wind parameter has changed. Please recalculate to see the updated wind actions.
            </AlertDescription>
          </Alert>
        )}
        <WindActionsTable title="N-S Direction" actions={windActionsNS} />
        <WindActionsTable title="E-W Direction" actions={windActionsEW} />
      </CardContent>
    </Card>
  );
}