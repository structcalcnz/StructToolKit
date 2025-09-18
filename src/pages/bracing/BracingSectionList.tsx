import { useState } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import type { BracingSection } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreVertical, Trash2, Pencil } from 'lucide-react';

export function BracingSectionList() {
  const { sections, activeSectionId } = useBoundStore();
  // Destructure the new action
  const { setActiveSection, addCustomSection, removeSection, updateSectionDetails } = useBoundStore(state => state.actions);

  // State for the delete confirmation dialog
  const [sectionToEdit, setSectionToEdit] = useState<BracingSection | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);

  const confirmDelete = () => {
    if (sectionToEdit) {
      removeSection(sectionToEdit.id);
      setDeleteDialogOpen(false);
      setSectionToEdit(null);
    }
  };

  const handleRenameSection = () => {
    if (sectionToEdit) {
      updateSectionDetails(sectionToEdit.id, { name: sectionToEdit.name });
      setRenameDialogOpen(false);
      setSectionToEdit(null);
    }
  };

  return (
    <div className="p-4 bg-muted/40 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold truncate">Bracing Sections</h2>
        <Button variant="ghost" size="icon" onClick={addCustomSection}>
          <PlusCircle />
        </Button>
      </div>
      <div className="space-y-2">
        {Object.values(sections).map(section => (
          <Card
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`py-2 px-4 cursor-pointer transition-colors ${activeSectionId === section.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'}`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="font-medium truncate">{section.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => { setSectionToEdit(section); setRenameDialogOpen(true); }}>
                      <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setSectionToEdit(section);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Section </DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="level-name">Bracing Section /Level Name</Label>
            <Input id="level-name" value={sectionToEdit?.name.split(' - ')[0] || ''} onChange={e => setSectionToEdit(prev => prev ? { ...prev, name: `${e.target.value} - ${prev.direction}` } : null)} className="mt-2" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleRenameSection}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the bracing section "{sectionToEdit?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}