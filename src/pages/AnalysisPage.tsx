import { useState, useRef, useEffect } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { SeismicPageContent } from './analysis/SeismicPageContent';
import { WindPageContent } from './analysis/WindPageContent';

// The main tool view: either seismic or wind
type AnalysisTool = 'seismic' | 'wind';

export default function AnalysisPage() {
  const [activeTool, setActiveTool] = useState<AnalysisTool>('seismic');
  
  // Create refs for the sections we want to scroll to
  const weightSectionRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const designSectionRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const pressureSectionRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const actionsSectionRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const { syncSeismicDataWithGeometry, calculateSeismicWeights } = useBoundStore(state => state.actions);
  const seismicInstances = useBoundStore(state => state.seismicInstances);

  // Sync data whenever the user switches to the seismic tool
  useEffect(() => {
    if (activeTool === 'seismic') {
      syncSeismicDataWithGeometry();
    }
  }, [activeTool, syncSeismicDataWithGeometry]);

 //  Auto-calculate weights after the data has been synced.
  useEffect(() => {
    // This effect runs whenever seismicInstances changes (i.e., after sync)
    // We check if there are any instances to prevent running on an empty model.
    if (Object.keys(seismicInstances).length > 0) {
      calculateSeismicWeights();
    }
  }, [seismicInstances, calculateSeismicWeights]);

  // Handler function to perform the smooth scroll
  const handleScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* --- Left Navigation Panel --- */}
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="p-4 bg-muted/40 h-full">
          <h2 className="text-lg font-semibold mb-6">Analysis Tools</h2>
          <div className="space-y-4">
            {/* Seismic Tools Section */}
            <div>
                <h3 className="text-sm text-muted-foreground mb-2 px-2">
                  Seismic Design
                </h3>
                <div className="space-y-1">
                  <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                          setActiveTool('seismic');
                          // Ensure content is rendered before scrolling
                          setTimeout(() => handleScrollTo(weightSectionRef), 0);
                      }}
                  >
                    Seismic Weight
                  </Button>
                  <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                          setActiveTool('seismic');
                          setTimeout(() => handleScrollTo(designSectionRef), 0);
                      }}
                  >
                    Seismic Design
                  </Button>
                </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm text-muted-foreground mb-2 px-2">
                Wind Design
              </h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  setActiveTool('wind');
                  setTimeout(() => handleScrollTo(pressureSectionRef), 0);
                }}>
                  Wind Pressure
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  setActiveTool('wind');
                  setTimeout(() => handleScrollTo(actionsSectionRef), 0);
                }}>
                  Wind Actions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
        {activeTool === 'seismic' ? (
          <SeismicPageContent 
            weightSectionRef={weightSectionRef}
            designSectionRef={designSectionRef}
          />
        ) : (
          <WindPageContent 
            pressureSectionRef={pressureSectionRef}
            actionsSectionRef={actionsSectionRef}
          />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}