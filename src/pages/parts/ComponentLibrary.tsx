import { useMemo, useState } from 'react';
import { useBoundStore } from '@/stores/useBoundStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
import { Plus } from 'lucide-react';
// ... import dialog components if you add the custom layer dialog here

export function ComponentLibrary() {
  const { categories, libraryComponents, activePartId } = useBoundStore();
  const { addLayerToActivePart, addCustomLayerToActivePart } = useBoundStore(state => state.actions);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategorizedComponents = useMemo(() => {
    // This logic is adapted from your LibraryTab and is excellent.
    const lowerCaseSearch = searchTerm.toLowerCase();
    if (!lowerCaseSearch) {
      return categories
        .map(cat => ({
          ...cat,
          components: libraryComponents.filter(c => c.categoryIds.includes(cat.id)),
        }))
        .filter(cat => cat.components.length > 0);
    }
    const matching = libraryComponents.filter(c => c.name.toLowerCase().includes(lowerCaseSearch));
    const relevantCategoryIds = new Set(matching.flatMap(c => c.categoryIds));
    return categories
      .filter(cat => relevantCategoryIds.has(cat.id))
      .map(cat => ({
        ...cat,
        components: matching.filter(c => c.categoryIds.includes(cat.id)),
      }));
  }, [categories, libraryComponents, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-muted/40 border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Component Library</h2>
        {/* Search Bar */}
        <Input placeholder="Search library..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mt-2" />
      </div>

        {/* Tree List */}
      <div className="flex-1 overflow-y-auto">
      <ScrollArea className="flex-1">
        <Accordion type="multiple" className="p-2">
          {filteredCategorizedComponents.map(category => (
            <AccordionItem value={category.id} key={category.id}>
              <AccordionTrigger>{category.name}</AccordionTrigger>
              <AccordionContent>
                {category.components.map(component => (
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                  <div
                    key={component.id}
                    onClick={() => activePartId && addLayerToActivePart(component.id)}
                    className={`p-2 rounded cursor-pointer ${activePartId ? 'hover:bg-accent' : 'text-gray-400 cursor-not-allowed'}`}
                  >
                    <p className="text-sm">{component.name}</p>
                  </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="end"
                        className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg max-w-sm leading-snug">
                        <p className="text-sm mb-1">{component.name}</p>
                        <p className="text-muted-foreground">{component.spec}</p>
                        {component.note && (<p className="text-xs italic text-muted-foreground mt-1">{component.note}</p>)}
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
      </div>
      <div className="flex p-4 border-t h-[85px] justify-center">
        <Button disabled={!activePartId} onClick={() => addCustomLayerToActivePart(0.1)} className="">
            <Plus className="mr-2 h-4 w-4" /> Add Custom Layer
        </Button>
      </div>
    </div>
  );
}