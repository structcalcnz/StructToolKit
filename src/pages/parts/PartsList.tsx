//`src/pages/parts/PartsList.tsx`

import { useState, useEffect } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import type { Part } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { MoreVertical, PlusCircle, Pencil, Trash2 } from 'lucide-react';
// ... import other necessary components like DropdownMenu

export function PartsList() {
  const { parts, activePartId, predefinedParts } = useBoundStore();
  const { addPart, setActivePart, removePart, updatePart } = useBoundStore(state => state.actions);
  
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  //const [isRoof, setIsRoof] = useState(false);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [partToRename, setPartToRename] = useState<Part | null>(null);
  const [selectedPredefinedID, setSelectedPredefinedID] = useState<string | undefined>(undefined);
  const [partToDelete, setPartToDelete] = useState<Part | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleAddPart = () => {
    if (newPartName) {
      addPart(newPartName.trim(), selectedPredefinedID);
      setNewPartName(''); // Reset input
      setAddDialogOpen(false); // Close dialog
    }
  };

  const applyPredefinedPart = (partId?: string) => {
    if (!partId) {
      setSelectedPredefinedID(undefined);
      setNewPartName("");
      return;
    }

    setSelectedPredefinedID(partId);
    const predefined = predefinedParts.find(p => p.id === partId);
    if (predefined) {
      setNewPartName(predefined.name);
    }
  };

  useEffect(() => {
    if (isAddDialogOpen) {
      applyPredefinedPart(selectedPredefinedID);
    }
  }, [isAddDialogOpen]);

  const handleRenamePart = () => {
    if (partToRename && partToRename.name.trim()) {
      updatePart(partToRename.id, {name: partToRename.name.trim()});
      setPartToRename(null); // Reset state
      setRenameDialogOpen(false); // Close dialog
    }
  };
  
  const openRenameDialog = (part: Part) => {
    setPartToRename({ ...part }); // Set the part to be renamed
    setRenameDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-muted/40 border-r p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Building Parts</h2>
          {/*new dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild><Button variant="ghost" size="icon"><PlusCircle/></Button></DialogTrigger>
              </TooltipTrigger>
              <TooltipContent> <p>New Part</p> </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DialogContent>
                <DialogHeader><DialogTitle>Create New Part</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Predefined parts select */}
                  <div className="flex flex-col">
                  <Label htmlFor="predefined-select">Create New or Predefined Part</Label>
                  <select
                    id="predefined-select"
                    className="w-full border rounded p-2 mt-2 dark:bg-gray-900"
                    value={selectedPredefinedID || ''}
                    onChange={e => applyPredefinedPart(e.target.value || undefined)}
                  >
                  <option value="">New Part</option>
                  {predefinedParts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
                <div className="space-y-1">
                      <Label htmlFor="part-name">Part Name</Label>
                      <Input id="part-name" value={newPartName} onChange={e => setNewPartName(e.target.value)} placeholder="e.g., Exterior Wall 1" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => handleAddPart()}
                  disabled={!newPartName.trim()}>Create Part</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {Object.values(parts).map(part => (
              <Card
                key={part.id}
                onClick={() => setActivePart(part.id)}
                className={`py-2 px-4 cursor-pointer transition-colors duration-150
                  ${activePartId === part.id ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-accent dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'}`}
              >
                <div className="flex w-full items-center justify-between">
                <span className="font-medium truncate">{part.name}</span>
                {/* ... DropdownMenu for rename/delete here ... */}
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* Stop propagation to prevent the div's onClick from firing */}
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md min-w-[8rem] p-1"
                  onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-accent focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                    onClick={() => openRenameDialog(part)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded text-red-600 hover:bg-red-100 focus:bg-red-500 focus:text-white whitespace-nowrap"
                    onClick={() => {
                      setPartToDelete(part);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </Card>
          ))}
      </div>
        
      {/* Rename Dialog  */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Part</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col">
              <Label htmlFor="rename-part-name" className="text-right">Name</Label>
              <Input
                id="rename-part-name"
                value={partToRename?.name || ''}
                onChange={(e) => partToRename && setPartToRename({ ...partToRename, name: e.target.value })}
                className="mt-2"
                onKeyDown={(e) => e.key === 'Enter' && handleRenamePart()}
              />
            </div>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
             </DialogClose>
            <Button type="submit" onClick={handleRenamePart}>Save Change</Button>
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
              {partToDelete && `"${partToDelete.name}" part`}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (partToDelete) {
                removePart(partToDelete.id);
                setPartToDelete(null);
                setDeleteDialogOpen(false);
                }
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