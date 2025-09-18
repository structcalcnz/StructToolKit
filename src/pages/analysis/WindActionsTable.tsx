import type { WindAction } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';

interface WindActionsTableProps {
  title: string;
  actions: WindAction[];
}

export function WindActionsTable({ title, actions }: WindActionsTableProps) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level</TableHead>
              <TableHead>Eff. Roof Area (Ar)</TableHead>
              <TableHead>Eff. Wall Area (Aw)</TableHead>
              <TableHead>Force (Fwi)</TableHead>
              <TableHead>Shear (Vi)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map(action => (
              <TableRow key={action.levelId}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {action.levelName}
                    {action.warning && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent><p>{action.warning}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>{action.effectiveRoofArea.toFixed(2)} m²</TableCell>
                <TableCell>{action.effectiveWallArea.toFixed(2)} m²</TableCell>
                <TableCell>{action.windForce.toFixed(2)} kN</TableCell>
                <TableCell className="text-amber-600 dark:text-blue-300 font-bold">{action.shear.toFixed(2)} kN</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}