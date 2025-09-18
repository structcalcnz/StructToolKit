import { useMemo, useState } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import type { BracingLine, BracingSection } from '@/types';
import { calculateMemberBUs } from '@/lib/bracingCalculationUtils';
import { BracingMemberRow } from './BracingMemberRow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Trash2, Plus, ChevronsUpDown, ArrowUp, ArrowDown, } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BracingLineCardProps {
  section: BracingSection;
  line: BracingLine;
  index: number;
}

const calculateMinDemand = (extWallLength: number, totalDemand: number, lineCount: number) => {
    const safeCount = lineCount > 0 ? lineCount : 1;
    return Math.max(100, 15 * extWallLength, (totalDemand / safeCount) * 0.5);
};

export function BracingLineCard({ section, line, index }: BracingLineCardProps) {
  const { bracingSystems } = useBoundStore();
  const { addBracingLine, removeBracingLine, updateBracingLine, reorderBracingLines } = useBoundStore(state => state.actions);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  //Helper to get the bracing member with the capacity in bracing units
  const membersWithCalculatedBUs = useMemo(() => {
    return line.members.map(member => {
      const typeData = bracingSystems.find(s => s.name === member.system)?.types.find(t => t.name === member.type);
      const isNumberBased = typeData && Object.keys(typeData.wind)[0] === 'n_1'; //'n-1' denote a number-based bracing
      const { totalWind, totalEQ } = calculateMemberBUs(member, bracingSystems, section.floorType);
      const unitWind = isNumberBased || member.lengthOrCount === 0 ? totalWind / (member.lengthOrCount || 1) : totalWind / member.lengthOrCount;
      const unitEQ = isNumberBased || member.lengthOrCount === 0 ? totalEQ / (member.lengthOrCount || 1) : totalEQ / member.lengthOrCount;
      return { ...member, calculated: { unitWind, unitEQ, totalWind, totalEQ } };
    });
  }, [line.members, bracingSystems, section.floorType]);

  const lineTotals = useMemo(() => {
    return membersWithCalculatedBUs.reduce(
      (acc, m) => ({ totalWind: acc.totalWind + m.calculated.totalWind, totalEQ: acc.totalEQ + m.calculated.totalEQ }),
      { totalWind: 0, totalEQ: 0 }
    );
  }, [membersWithCalculatedBUs]);
  
  const minDemandWind = calculateMinDemand(line.externalWallLength, section.demandWind, section.lines.length);
  const minDemandEQ = calculateMinDemand(line.externalWallLength, section.demandEQ, section.lines.length);

  const isWindOk = lineTotals.totalWind >= minDemandWind;
  const isEqOk = lineTotals.totalEQ >= minDemandEQ;

  return (
    <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-x-2 sticky left-0 z-10">
            <div className="flex-1 flex items-center gap-x-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="flex-shrink-0">Bracing Line</Label>
                <Input value={line.name} onChange={e => updateBracingLine(section.id, line.id, { name: e.target.value })} className="w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Label title='The legnth of the external wall belongs to this bracing line. ' className="flex-shrink-0">Extl. Wall (m)</Label>
                <Input type="number" value={line.externalWallLength} onChange={e => updateBracingLine(section.id, line.id, { externalWallLength: Number(e.target.value) })} className="w-28" />
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => addBracingLine(section.id, index)}><Plus className="h-4 w-4" /></Button>
              {/* NEW: Dropdown Menu for actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><ChevronsUpDown className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => reorderBracingLines(section.id, index, index - 1)} disabled={index === 0}>
                    <ArrowUp className="mr-2 h-4 w-4" /> Move Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => reorderBracingLines(section.id, index, index + 1)} disabled={index === section.lines.length - 1}>
                    <ArrowDown className="mr-2 h-4 w-4" /> Move Down
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialogOpen(true)} disabled={section.lines.length <= 2}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Line
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="px-4">
              <Table>
                <TableHeader className="sticky left-0 z-10">
                  <TableRow>
                    <TableHead className="pl-4" style={{width: 100}}>Label</TableHead>
                    <TableHead className="pl-4">System</TableHead>
                    <TableHead className="pl-4">Type</TableHead>
                    <TableHead style={{width: 90}}>Length/No.</TableHead>
                    <TableHead style={{width: 90}}>Height</TableHead>
                    <TableHead >Unit Wind</TableHead>
                    <TableHead >Unit EQ</TableHead>
                    <TableHead >Total Wind</TableHead>
                    <TableHead >Total EQ</TableHead>
                    <TableHead >Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersWithCalculatedBUs.map((member, idx) => (
                    <BracingMemberRow
                      key={member.id}
                      sectionId={section.id}
                      lineId={line.id}
                      member={member}
                      index={idx}
                      totalMembers={line.members.length}
                      calculated={member.calculated}
                    />
                  ))}
                </TableBody>
              </Table>
          </CardContent>
          <CardFooter className="justify-end px-4 py-2 sticky left-0 z-10">
            <div className="w-full max-w-md grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div></div>
              <div className="font-bold text-center">Wind</div>
              <div className="font-bold text-center">EQ</div>
              <div className="font-semibold text-right">Min. Demand</div>
              <div className="text-center bg-muted rounded p-1">{minDemandWind.toFixed(0)}</div>
              <div className="text-center bg-muted rounded p-1">{minDemandEQ.toFixed(0)}</div>
              <div className="font-semibold text-right">Line Provided</div>
              <div className="text-center bg-muted rounded p-1">{lineTotals.totalWind.toFixed(0)}</div>
              <div className="text-center bg-muted rounded p-1">{lineTotals.totalEQ.toFixed(0)}</div>
              <div className="font-semibold text-right">Result</div>
              <div className={cn("text-center font-bold rounded p-1", isWindOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isWindOk ? "OK" : "NG"}</div>
              <div className={cn("text-center font-bold rounded p-1", isEqOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isEqOk ? "OK" : "NG"}</div>
            </div>
          </CardFooter>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
            <DialogDescription>
              Are you sure you want to delete the bracing line "{line.name}"? This action cannot be undone.
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={() => removeBracingLine(section.id, line.id)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}