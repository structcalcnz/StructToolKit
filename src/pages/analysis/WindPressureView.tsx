
import { useBoundStore } from '@/stores/useBoundStore';
import { WindLevelSummary } from './WindLevelSummary';
import { WindBuildingSummary } from './WindBuildingSummary';
import { WindNZS3604 } from './WindNZS3604';
import { WindNZS1170 } from './WindNZS1170';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; 


export function WindPressureView() {
  const { useNZS1170 } = useBoundStore(state => state.windInputs);
  
  return (
    <div className="space-y-6">
      <WindLevelSummary />
      <WindBuildingSummary />
      <Card>
        <CardHeader><CardTitle>NZS 3604 Wind Pressures</CardTitle></CardHeader>
        <CardContent>
            
            <WindNZS3604 />
        </CardContent>
      </Card>
      {useNZS1170 && (
        <Card>
          <CardHeader><CardTitle>NZS 1170.2 Wind Pressures</CardTitle></CardHeader>
          <CardContent>
            <WindNZS1170 />
          </CardContent>
        </Card>
      )}
    </div>
  );
}