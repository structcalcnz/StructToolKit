import { useState } from 'react';
import type { Layer } from '@/types';
import { useBoundStore } from '@/stores/useBoundStore';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MoreVertical, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface LayerCardProps {
  layer: Layer;
  partId: string;
  index: number;
  totalLayers: number;
}

export function LayerCard({ layer, partId, index, totalLayers }: LayerCardProps) {
  const { updateLayerParams, removeLayer, renameLayer, reorderLayers } = useBoundStore(state => state.actions);
  //unit converting
  const [params, setParams] = useState(layer.params);
  const DIMENSION_KEYS = ['thickness', 'width', 'depth', 'spacing'];
 // dialog state
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(layer.name);
  const [layerToDelete, setLayerToDelete] = useState<{ partId: string; layerId: string } | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleParamChange = (key: string, value: string) => {
    let newValue = parseFloat(value) || 0;
    // Convert mm from UI back to meters for storage
    if (DIMENSION_KEYS.includes(key)) {
      newValue = newValue / 1000;
    }
    const newParams = { ...params, [key]: newValue };
    setParams(newParams);
    updateLayerParams(partId, layer.id, newParams);
  };

  const displayValue = (key: string, value: number) => {
    // Convert meters to mm for display
    if (DIMENSION_KEYS.includes(key)) {
      if (key === 'thickness') return (value * 1000).toFixed(2);
      return (value * 1000).toFixed(0);
    }
    return value;
  };

  const handleRenameLayer = () => {
    if (newName.trim()) {
      renameLayer(partId, layer.id, newName.trim());
      setRenameDialogOpen(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg"> {index + 1}. {layer.name}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => reorderLayers(partId, index, index - 1)}
              disabled={index === 0} // Disable if it's the first item
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              <span>Move Up</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => reorderLayers(partId, index, index + 1)}
              disabled={index === totalLayers - 1} // Disable if it's the last item
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              <span>Move Down</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              className="text-red-600 focus:text-white focus:bg-red-500"
              onClick={() => {
                setLayerToDelete({ partId, layerId: layer.id });
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {Object.entries(layer.params).map(([key, value]) => (
            <div key={key} className="space-y-1">
                <Label className="text-xs">
                    <span className="capitalize">{key}</span>
                    {DIMENSION_KEYS.includes(key) && ' (mm)'}
                    {['weight'].includes(key)&& ' (kPa)'}</Label>
                <Input 
                    type="number" 
                    value={displayValue(key, value as number)} 
                    onChange={e => handleParamChange(key, e.target.value)}
                    className="mt-1"
                />
            </div>
        ))}
      </div>
      <div className="text-right mt-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Weight: 
        </span>
        <span className="ml-1 font-semibold text-amber-600 dark:text-blue-300">
          {layer.weight && layer.weight.toFixed(3)} kPa
        </span>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Layer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col">
              <Label htmlFor="rename-layer-name" className="text-right">Name</Label>
              <Input
                id="rename-layer-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-2"
                onKeyDown={(e) => e.key === 'Enter' && handleRenameLayer()}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleRenameLayer}>
              Save Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* delete Dialog  */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              this layer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (layerToDelete) {
                  removeLayer(layerToDelete.partId, layerToDelete.layerId);
                  setLayerToDelete(null);
                }
                setDeleteDialogOpen(false);                
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}