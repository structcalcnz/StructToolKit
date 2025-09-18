import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBoundStore } from '@/stores/useBoundStore';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { buildingSchema } from "@/types";

type BuildingInfo = z.infer<typeof buildingSchema.shape.buildingInfo>;

export default function SetupPage() {
  //const actions = useBoundStore((state) => state.actions);
  //console.log("actions", actions);
  const buildingInfo = useBoundStore((state) => state.building.buildingInfo);
  const updateBuildingInfo = useBoundStore((state) => state.actions.updateBuildingInfo);
  const createNewJob = useBoundStore((state) => state.actions.createNewJob);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={20} className="min-w-[150px]" >
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold mb-6 truncate">Project Manager</h1>
          <div className="flex flex-col p-2 space-y-4">
            <Button onClick={createNewJob}>New Job</Button>
            <Button variant="outline">Load Job</Button>
            <Button variant="outline">Save Job</Button>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80}>
                  
          <div className="flex flex-col h-full p-6">
            <h1 className="text-2xl font-bold mb-4">Project Information</h1>
            <p className="text-sm text-gray-500 mb-6">
              Input the project information here.
            </p>
            {/* Scrollable area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 max-h-[calc(100vh-6rem)]">
              {(Object.keys(buildingInfo) as Array<keyof BuildingInfo>).map((key) => {
                const value = buildingInfo[key];
                const safeId = key.replace(/\s+/g, "-").toLowerCase();
                const isDate = key.toLowerCase() === "date";
                const isNote = key.toLowerCase() === "note";

                return (
                  <div key={key} className="flex flex-col space-y-2 md:col-span-1">
                    <Label htmlFor={safeId}>{key}</Label>
                    {isNote ? (
                      <Textarea
                        id={safeId}
                        value={value ?? ""}
                        onChange={(e) => updateBuildingInfo(key, e.target.value)}
                        className="min-h-[120px]"
                      />
                    ) : (
                      <Input
                        id={safeId}
                        type={isDate ? "date" : "text"}
                        value={value ?? ""}
                        onChange={(e) => updateBuildingInfo(key, e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
         
        
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}