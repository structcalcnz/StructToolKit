//`src/stores/slices/levelsSlice.ts`

import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Level, LevelPart } from '@/types';
//import type { PartsSlice } from './partsSlice'; // For cross-slice interaction
import {type BoundState} from "../useBoundStore"

// Helper to calculates the dead weight contribution of a single LevelPart instance
const calculateLevelPartWeight = (part: LevelPart): number => {
  if (part.partType === 'Wall') {
    // For a wall: length x height x openingFactor x baseWeight
    return (part.length || 0) * (part.height || 0) * (part.openingFactor || 1) * part.baseWeight;
  }
  // For a floor, roof or other: area x baseWeight
  return (part.area || 0) * part.baseWeight;
};

// Helper to recalculation utility for a level
const updateAndRecalculateLevel = (level: Level): Level => {
  // Recalculate total floor/roof area
  level.totalArea = level.parts.reduce((sum, part) => {
    if (part.partType === 'Floor' || part.partType === 'Roof') {
      return sum + (part.area || 0);
    }
    return sum;
  }, 0);

  // Recalculate total level dead weight
  level.totalLevelWeight = level.parts.reduce((sum, part) => {
    return sum + calculateLevelPartWeight(part);
  }, 0);

  return level;
};

// These are simple, predefined parts that can be added to levels directly
const PREDEFINED_LEVEL_PARTS = [
  { name: 'Light Roof - NZS3604', baseWeight: 0.45, partType: 'Roof' as const },
  { name: 'Heavy Roof - NZS3604', baseWeight: 0.85, partType: 'Roof' as const },
  { name: 'Light Cladding Wall - NZS3604', baseWeight: 0.5, partType: 'Wall' as const },
  { name: 'Medium Cladding Wall - NZS3604', baseWeight: 0.8, partType: 'Wall' as const },
  { name: 'Heavy Cladding Wall - NZS3604', baseWeight: 2.2, partType: 'Wall' as const },
  { name: 'Floor - NZS3604', baseWeight: 0.45, partType: 'Floor' as const },
  { name: 'Partition Wall', baseWeight: 0.3, partType: 'Other' as const },
  { name: 'Other', baseWeight: 1.0, partType: 'Other' as const },
];

export interface LevelsSlice {
  levels: Record<string, Level>;
  levelOrder: string[]; 
  activeLevelId: string | null;
  predefinedLevelParts: { name: string; baseWeight: number; partType: 'Wall'| 'Floor'| 'Roof'| "Other" }[];
  actions: {
    // Level Actions
    addLevel: (name: string) => void;
    removeLevel: (levelId: string) => void;
    setActiveLevel: (levelId: string | null) => void;
    updateLevelDetails: (levelId: string, updates: Partial<Pick<Level, 'name' | 'storeyHeight' | 'planDimNS' | 'planDimEW'>>) => void;
    reorderLevels: (startIndex: number, endIndex: number) => void;
    // LevelPart Actions
    addPartToLevel: (levelId: string, partId: string) => void;
    addPredefinedPartToLevel: (levelId: string, predefinedPart: {
      partType: "Wall" | "Floor" | "Roof" | "Other"; name: string, baseWeight: number 
}) => void;
    removePartFromLevel: (levelId: string, instanceId: string) => void;
    updateLevelPart: (levelId: string, instanceId: string, updates: Partial<LevelPart>) => void;
  };
}

export const createLevelsSlice: StateCreator<
  BoundState, 
  [['zustand/immer', never]],
  [],
  LevelsSlice
> = (set, get) => {
  // Create a default first level
  const defaultLevelId = uuidv4();
  const defaultLevel: Level = {
    id: defaultLevelId,
    name: 'Level 1',
    storeyHeight: 2.4,
    planDimNS: 10,
    planDimEW: 10,
    totalArea: 0,
    totalLevelWeight: 0,
    parts: [],
  };

  return {
    levels: { [defaultLevelId]: defaultLevel },
    levelOrder: [defaultLevelId],
    activeLevelId: defaultLevelId,
    predefinedLevelParts: PREDEFINED_LEVEL_PARTS,
    actions: {
      addLevel: (name) => {
        const newId = uuidv4();
        set(state => {
          state.levels[newId] = { ...defaultLevel, id: newId, name };
          state.levelOrder.push(newId);
          state.activeLevelId = newId;
        });
      },
      removeLevel: (levelId) => {
        set(state => {
          delete state.levels[levelId];
          state.levelOrder = state.levelOrder.filter(id => id !== levelId);
          if (state.activeLevelId === levelId) {
            state.activeLevelId = Object.keys(state.levels)[0] || null;
          }
        });
      },
      setActiveLevel: (levelId) => set({ activeLevelId: levelId }),
      updateLevelDetails: (levelId, updates) => {
        set(state => {
          const level = state.levels[levelId];
          if (level) Object.assign(level, updates);
        });
      },
      reorderLevels: (startIndex, endIndex) => {
        set(state => {
            const [removed] = state.levelOrder.splice(startIndex, 1);
            state.levelOrder.splice(endIndex, 0, removed);
        });
      },
      addPartToLevel: (levelId, partId) => {
        const part = get().parts[partId]; // Cross-slice access
        if (!part) return;
        const level = get().levels[levelId];

        const newLevelPart: LevelPart = {
          instanceId: uuidv4(),
          name: part.name,
          partId: part.id,
          partType: part.partType, // Get type from the source Part
          baseWeight: part.totalWeight,
          // ... geometry and default loads
        };
        
        if (part.partType === 'Roof') {
          newLevelPart.liveLoad = 0.25;
          newLevelPart.area=50;
          newLevelPart.height=0.9}
        if (part.partType === 'Floor') {
          newLevelPart.liveLoad = 2.0;
          newLevelPart.area=50}  
        if (part.partType === 'Wall') {
          newLevelPart.windPressure = 1.0;
          newLevelPart.height=level.storeyHeight;
          newLevelPart.length = 10;
          newLevelPart.openingFactor =1.0
        }

        set(state => {
          state.levels[levelId]?.parts.push(newLevelPart);
          state.levels[levelId] = updateAndRecalculateLevel(state.levels[levelId]);
        });
      },
      addPredefinedPartToLevel: (levelId, predefinedPart) => {
        const level = get().levels[levelId];
        const newLevelPart: LevelPart = {
          instanceId: uuidv4(),
          name: predefinedPart.name,
          partId: null, // No link to a full part
          partType: predefinedPart.partType, // Default to Wall
          baseWeight: predefinedPart.baseWeight,
        };

        if (predefinedPart.partType === 'Roof') {
          newLevelPart.liveLoad = 0.25;
          newLevelPart.area=50;
          newLevelPart.height=0.9
        }
        if (predefinedPart.partType === 'Floor') {
          newLevelPart.liveLoad = 2.0;
          newLevelPart.area=50
        }  
        if (predefinedPart.partType === 'Wall') {
          newLevelPart.windPressure = 1.0;
          newLevelPart.height=level.storeyHeight;
          newLevelPart.length = 10;
          newLevelPart.openingFactor =1.0
        }
        if (predefinedPart.partType === 'Other') {
          newLevelPart.area=50
        }  

         set(state => {
          const currentLevel = state.levels[levelId];
          if (currentLevel) {
            currentLevel.parts.push(newLevelPart);
            // Use the master recalculate function
            state.levels[levelId] = updateAndRecalculateLevel(currentLevel);
          }
        });
      },
      removePartFromLevel: (levelId, instanceId) => {
        set(state => {
          const level = state.levels[levelId];
          if (level) {
            level.parts = level.parts.filter(p => p.instanceId !== instanceId);
            state.levels[levelId] = updateAndRecalculateLevel(level);
          }
        });
      },
      updateLevelPart: (levelId, instanceId, updates) => {
        set(state => {
          const level = state.levels[levelId];
          const partInstance = level?.parts.find(p => p.instanceId === instanceId);
          if (partInstance) {
            Object.assign(partInstance, updates);
            // If the partType changes, reset other geometric props
            if (updates.partType) {
              if (updates.partType === 'Wall') {
                delete partInstance.area;
              } else {
                delete partInstance.length;                
                delete partInstance.openingFactor;
                if (updates.partType !== 'Roof') {delete partInstance.height;}
              }
            }
          }
          if (level) state.levels[levelId] = updateAndRecalculateLevel(level);
        });
      },
    },
  };
};