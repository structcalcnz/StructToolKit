import { useState } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import type { Level } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreVertical, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export function LevelsList() {
  const { levels, levelOrder, activeLevelId } = useBoundStore();
  const { addLevel, removeLevel, setActiveLevel, updateLevelDetails, reorderLevels } = useBoundStore(state => state.actions);

  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [levelToRename, setLevelToRename] = useState<Level | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null);

  const handleAddLevel = () => {
    const levelCount = Object.keys(levels).length + 1;
    addLevel(`Level ${levelCount}`);
  };

  const handleRenameLevel = () => {
    if (levelToRename) {
      updateLevelDetails(levelToRename.id, { name: levelToRename.name });
      setRenameDialogOpen(false);
      setLevelToRename(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/40 border-r p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Building Levels</h2>
        <Button variant="ghost" size="icon" onClick={handleAddLevel}>
          <PlusCircle />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {levelOrder.map((levelId, index) => {
          const level = levels[levelId];
          if (!level) return null;
          return (
            <Card
              key={level.id}
              onClick={() => setActiveLevel(level.id)}
              className={`py-2 px-4 cursor-pointer transition-colors ${activeLevelId === level.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'}`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-medium truncate">{level.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => { setLevelToRename({ ...level }); setRenameDialogOpen(true); }}>
                      <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => reorderLevels(index, index - 1)} disabled={index === 0}>
                      <ArrowUp className="mr-2 h-4 w-4" /> Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => reorderLevels(index, index + 1)} disabled={index === levelOrder.length - 1}>
                      <ArrowDown className="mr-2 h-4 w-4" /> Move Down
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => { setLevelToDelete(level); setDeleteDialogOpen(true); }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Level</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="level-name">Level Name</Label>
            <Input id="level-name" value={levelToRename?.name || ''} onChange={e => setLevelToRename(prev => prev ? { ...prev, name: e.target.value } : null)} className="mt-2" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleRenameLevel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
          <DialogDescription>
            Are you sure you want to delete "{levelToDelete?.name}"? This cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={() => { if (levelToDelete) removeLevel(levelToDelete.id); setDeleteDialogOpen(false); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}