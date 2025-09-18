import { useMemo } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import { EmptyState } from '@/components/common/EmptyState'; 

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building } from 'lucide-react';

export function WindLevelSummary() {
  const { levels, levelOrder } = useBoundStore();

  // useMemo ensures this complex calculation only runs when level data changes
  const levelSummaryData = useMemo(() => {
    return [...levelOrder].reverse().map(levelId => {
      const level = levels[levelId];
      if (!level) return null;

      const roofParts = level.parts.filter(p => p.partType === 'Roof');
      let averageRoofHeight = 0;

      if (roofParts.length > 0) {
        const totalRoofArea = roofParts.reduce((sum, p) => sum + (p.area || 0), 0);
        if (totalRoofArea > 0) {
          const weightedHeightSum = roofParts.reduce((sum, p) => sum + (p.height || 0) * (p.area || 0), 0);
          averageRoofHeight = weightedHeightSum / totalRoofArea;
        }
      }

      return {
        id: level.id,
        name: level.name,
        storeyHeight: level.storeyHeight,
        avgRoofHeight: averageRoofHeight,
        dimNS: level.planDimNS,
        dimEW: level.planDimEW,
      };
    }).filter(Boolean); // Remove any null entries
  }, [levels, levelOrder]);

 if (levelOrder.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Level Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
             <EmptyState
                Icon={Building}
                title="No Levels Defined"
                description="Wind analysis requires at least one level. Please go to the 'Levels' page to create your building model first."
             />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Level Summary</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level Name</TableHead>
              <TableHead>Storey Height (m)</TableHead>
              <TableHead>Avg. Roof Height (m)</TableHead>
              <TableHead>N-S Dim (m)</TableHead>
              <TableHead>E-W Dim (m)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levelSummaryData.map(level => (
              <TableRow key={level!.id}>
                <TableCell>{level!.name}</TableCell>
                <TableCell>{level!.storeyHeight.toFixed(2)}</TableCell>
                <TableCell>{level!.avgRoofHeight.toFixed(2)}</TableCell>
                <TableCell>{level!.dimNS.toFixed(2)}</TableCell>
                <TableCell>{level!.dimEW.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}