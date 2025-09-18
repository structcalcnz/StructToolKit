import type { StateCreator } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { Category, LibraryComponent, Part, Layer } from '@/types';
import libraryData from '@/data/compDatabase.json';


type RawComponent = Partial<LibraryComponent>;

const normalizedComponents: LibraryComponent[] = (libraryData.components as unknown as RawComponent[]).map(c => ({
  ...c,
  id: c.id ?? uuidv4(),
  name: c.name ?? 'Unnamed Component',
  categoryIds: c.categoryIds ?? [],
  spec: c.spec ?? '',
  note: c.note ?? '',
  unitWeight: c.unitWeight ?? null,
  calcType: (c.calcType === 'area' || c.calcType === 'solid' || c.calcType === 'number' ? c.calcType : 'area') as 'area' | 'solid' | 'number',
  defaultParams: Object.fromEntries(
    Object.entries(c.defaultParams ?? {}).map(([k, v]) => [k, typeof v === 'number' ? v : (typeof v === 'undefined' ? 0 : Number(v))])
  ) as Record<string, number>,
}));

// --- Helper Functions ---
const calculateLayerWeight = (component: LibraryComponent, params: Record<string, number>): number => {
  if (!component) return 0;
  
  switch (component.calcType) {
    case 'area':
      // Weight = unitWeight (kN/m3) * thickness (m)
      return (component.unitWeight ?? 0) * (params.thickness ?? 0);
    case 'solid':
      // Weight = unitWeight (kN/m3) * depth (m) * width (m) / spacing (m)
      return (component.unitWeight ?? 0) * (params.depth ?? 0) * (params.width ?? 0) / (params.spacing ?? 1);
    case 'number':
       // Weight = unitWeight (kN) / spacing (m)
       return (component.unitWeight ?? 0) / (params.spacing ?? 1);
    default:
      return 0;
  }
};

const recalculatePartWeight = (part: Part): Part => {
  const totalLayerWeight = part.layers.reduce((sum, layer) => sum + (layer.weight ?? 0), 0);
  if (part.roofSlope !== undefined && part.roofSlope > 0) {
    if (part.roofSlope >= 90) {
      part.totalWeight = 0;
      return part;
    }
    const slopeInRadians = part.roofSlope * (Math.PI / 180);
    part.totalWeight = totalLayerWeight / Math.cos(slopeInRadians);
    return part;
  }
  part.totalWeight = totalLayerWeight;
  return part;
};


export interface PartsSlice {
  categories: Category[];
  libraryComponents: LibraryComponent[];
  predefinedParts: Part[];
  parts: Record<string, Part>;
  activePartId: string | null;
  actions: {
    // Part Actions
    addPart: (name: string, predefinedPartId?: string) => void;
    removePart: (partId: string) => void;
    setActivePart: (partId: string | null) => void;
    // updatePartName: (partId: string, newName: string) => void;
    //toggleRoof: (artId: string, enabled: boolean, slope: number) => void;
    updatePart: (partId: string, updates: Partial<Pick<Part, 'name' | 'partType' | 'roofSlope'>>) => void;
    //updateRoofSlope: (partId: string, slope: number) => void;
    // Layer Actions
    addLayerToActivePart: (componentId: string) => void;
    addCustomLayerToActivePart: (weight: number) => void;
    removeLayer: (partId: string, layerId: string) => void;
    updateLayerParams: (partId: string, layerId: string, newParams: Record<string, number>) => void;
    renameLayer: (partId: string, layerId: string, newName: string) => void;
    reorderLayers: (partId: string, startIndex: number, endIndex: number) => void;
  };
}

export const createPartsSlice: StateCreator<PartsSlice, [['zustand/immer', never]], [], PartsSlice> = (set, get, store) => ({
  categories: libraryData.categories,
  libraryComponents: normalizedComponents,
  predefinedParts: libraryData.predefinedParts.map((part: any) => ({
    ...part,
    layers: part.layers.map((layer: Layer) => ({
      ...layer,
      params: Object.fromEntries(
        Object.entries(layer.params).map(([k, v]) => [k, typeof v === 'number' ? v : 0])
      ),
    })),
  })),
  parts: {},
  activePartId: null,
  actions: {
    addPart: (name, predefinedPartId?: string) => set(produce(draft => {
      let newPart: Part | undefined;
      const newPartId = uuidv4();

      if (predefinedPartId) {
        // Find the template from the predefined parts data
        const predefined = draft.predefinedParts.find((p: Part) => p.id === predefinedPartId);

        if (predefined) {
          newPart = {
            ...predefined,
            id: newPartId,
            name: predefined.name || name, // Use the predefined name as the default
            partType:predefined.partType,
            roofSlope: predefined.roofSlope,
            layers: predefined.layers.map((layer: Layer) => {
              const component = draft.libraryComponents.find((c: LibraryComponent) => c.id === layer.libraryComponentId);
              // Handle cases where a component might not be found in the library
              if (!component) {
                return { ...layer, id: uuidv4(), weight: 0 };
              }
              const weight = calculateLayerWeight(component, layer.params);
              // BEST PRACTICE: Also give each new layer instance a unique ID
              return { ...layer, id: uuidv4(), weight };
            }),
            totalWeight: 0, // Placeholder, will be calculated next
          };
        }
      }

      if (!newPart) {
        newPart = {
          id: newPartId, // Use the same ID generated at the start
          name,
          partType: "Roof",
          layers: [], // A new blank part correctly has an empty layers array
          totalWeight: 0,
          roofSlope: 15,
        };
      }
      // Recalculate the total weight for the final created part (either predefined or new)
      newPart = recalculatePartWeight(newPart);
      draft.parts[newPart.id] = newPart; // Correctly assign to the record
      draft.activePartId = newPart.id;
    })),

    removePart: (partId) => {
      set(state => {
        delete state.parts[partId];
        if (state.activePartId === partId) {
          state.activePartId = Object.keys(state.parts)[0] || null;
        }
      });
    },
    setActivePart: (partId) => set({ activePartId: partId }),
    // updatePartName: (partId, newName) => {
    //   set(state => {
    //     if (state.parts[partId]) state.parts[partId].name = newName;
    //   });
    // },
    // toggleRoof: (partId: string, enabled: boolean, slope = 0) =>
    //   set(state => {
    //     const part = state.parts[partId];
    //     if (part) {
    //       part.roofSlope = enabled ? slope : undefined;
    //       state.parts[partId] = recalculatePartWeight(part);
    //     };
    // }),
    updatePart: (partId, updates) => {
        set(state => {
            const part = state.parts[partId];
            if (!part) return;

            Object.assign(part, updates);
            // Logic for handling slope based on the new partType
            const isSlopedType = part.partType === 'Roof' || part.partType === 'Floor';
            if (updates.partType && !isSlopedType) {
                // If type changes to Wall/Other, remove slope
                delete part.roofSlope;
            } else if (updates.partType && isSlopedType) {
                // If type changes to Roof/Floor and there's no slope, add a default
                if (part.partType === 'Roof' && (part.roofSlope === 0 || part.roofSlope === undefined)) {
                  part.roofSlope = 15} else if (part.partType === 'Floor') {
                  part.roofSlope = 0 
                  }
            }
            
            // Always recalculate weight when slope might have changed
            state.parts[partId] = recalculatePartWeight(part);
        });
    },
    // updateRoofSlope: (partId, slope) => {
    //   set(state => {
    //     const part = state.parts[partId];
    //     if (part && part.roofSlope !== undefined) {
    //       part.roofSlope = slope;
    //       state.parts[partId] = recalculatePartWeight(part);
    //     }
    //   });
    // },
    addLayerToActivePart: (componentId) => {
      const { activePartId, libraryComponents } = get();
      if (!activePartId) return;

      const component = libraryComponents.find(c => c.id === componentId);
      if (!component) return;

      const newLayer: Layer = {
        id: uuidv4(),
        libraryComponentId: component.id,
        name: component.name,
        params: { ...component.defaultParams },
        weight: calculateLayerWeight(component, component.defaultParams),
        isCustom: false,
      };

      set(state => {
        const part = state.parts[activePartId];
        if (part) {
          part.layers.push(newLayer);
          state.parts[activePartId] = recalculatePartWeight(part);
        }
      });
    },
    addCustomLayerToActivePart: (weight) => {
        const { activePartId } = get();
        if (!activePartId) return;

        const newLayer: Layer = {
            id: uuidv4(),
            libraryComponentId: 'custom',
            name: 'Custom Weight Layer',
            params: { weight },
            weight: weight,
            isCustom: true,
        };
        set(state => {
            const part = state.parts[activePartId];
            if(part) {
                part.layers.push(newLayer);
                state.parts[activePartId] = recalculatePartWeight(part);
            }
        });
    },
    removeLayer: (partId, layerId) => {
      set(state => {
        const part = state.parts[partId];
        if (part) {
          part.layers = part.layers.filter(l => l.id !== layerId);
          state.parts[partId] = recalculatePartWeight(part);
        }
      });
    },
    updateLayerParams: (partId, layerId, newParams) => {
      set(state => {
        const part = state.parts[partId];
        const layer = part?.layers.find(l => l.id === layerId);
        if (part && layer && !layer.isCustom) {
          const component = state.libraryComponents.find(c => c.id === layer.libraryComponentId);
          if (component) {
            layer.params = newParams;
            layer.weight = calculateLayerWeight(component, newParams);
            state.parts[partId] = recalculatePartWeight(part);
          }
        } else if (part && layer && layer.isCustom) {
            // Handle custom layer weight update
            layer.params = newParams;
            layer.weight = newParams.weight || 0;
            state.parts[partId] = recalculatePartWeight(part);
        }
      });
    },
    renameLayer: (partId, layerId, newName) => {
        set(state => {
            const layer = state.parts[partId]?.layers.find(l => l.id === layerId);
            if(layer) layer.name = newName;
        });
    },
    reorderLayers: (partId, startIndex, endIndex) => {
        set(state => {
            const part = state.parts[partId];
            if(part) {
                const [removed] = part.layers.splice(startIndex, 1);
                part.layers.splice(endIndex, 0, removed);
            }
        });
    },
  },
});