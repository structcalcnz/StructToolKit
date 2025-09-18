import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { BracingSection, BracingLine, BracingMember } from '@/types';
//import type { LevelsSlice } from './levelsSlice'; // For cross-slice data
//import type { AnalysisSlice } from './analysisSlice';
import {type BoundState} from "../useBoundStore"

import bracingData from '@/data/bracingData.json';

function createDefaultMember(lineName: string): BracingMember {
  return {
    id: uuidv4(),
    name: `${lineName}-1`,
    system: 'GIB',
    type: 'GS1-N',
    lengthOrCount: 1.2,
    height: 2.4,
  };
}


export interface BracingSlice {
  bracingSystems: typeof bracingData.systems;
  sections: Record<string, BracingSection>; // Normalized by sectionId
  activeSectionId: string | null;
  actions: {
    generateDefaultSections: () => void;
    addCustomSection: () => void;
    removeSection: (sectionId: string) => void;
    setActiveSection: (sectionId: string | null) => void;
    updateSectionDetails: (sectionId: string, updates: Partial<BracingSection>) => void;
    // Line Actions
    addBracingLine: (sectionId: string, index: number) => void;
    removeBracingLine: (sectionId: string, lineId: string) => void;
    updateBracingLine: (sectionId: string, lineId: string, updates: Partial<BracingLine>) => void;
    reorderBracingLines: (sectionId: string, startIndex: number, endIndex: number) => void;
    // Member Actions
    addBracingMember: (sectionId: string, lineId: string, index: number) => void;
    removeBracingMember: (sectionId: string, lineId: string, memberId: string) => void;
    updateBracingMember: (sectionId: string, lineId: string, memberId: string, updates: Partial<BracingMember>) => void;
    resetSectionDemands: (sectionId: string)=> void;
  };
}

export const createBracingSlice: StateCreator<
  BoundState,
  [['zustand/immer', never]],
  [],
  BracingSlice
> = (set, get) => ({
  bracingSystems: bracingData.systems,
  sections: {},
  activeSectionId: null,

  actions: {

      // --- Section Actions ---
      generateDefaultSections: () => {
        const { levelOrder, levels, seismicActions, windActionsNS, windActionsEW } = get();
        const newSections: Record<string, BracingSection> = {};

        if (levelOrder.length === 0) {
          set({ sections: {}, activeSectionId: null });
          return;
        }
        
        levelOrder.forEach(levelId => {
          (['NS', 'EW'] as const).forEach(direction => {
            const id = `${levelId}-${direction}`;
            const level = levels[levelId];
            if (!level) return;

            const eqAction = seismicActions.find(a => a.levelId === levelId);
            const windActions = direction === 'NS' ? windActionsNS : windActionsEW;
            const windAction = windActions.find(a => a.levelId === levelId);           
            
            
            newSections[id] = {
              id,
              levelId,
              direction,
              name: `${level.name} - ${direction}`,
              floorType: 'Timber',
              demandWind: Math.round((windAction?.shear || 0)*20), // Shear becomes the demand
              demandEQ: Math.round((eqAction?.shear || 0)*20),
              lines: [
                { id: uuidv4(), name: 'BL-1', externalWallLength: 0, members: [createDefaultMember('BL-1')] },
                { id: uuidv4(), name: 'BL-2', externalWallLength: 0, members: [createDefaultMember('BL-2')] },
              ],
            };
          });
        });
        set({ sections: newSections, activeSectionId: Object.keys(newSections)[0] || null });
      },

      addCustomSection: () => {
        const newId = uuidv4();
        const newSection: BracingSection = {
          id: newId,
          levelId: get().levelOrder[0] || 'custom', // Assign to first level or a placeholder
          direction: 'NS',
          name: 'Custom Section',
          floorType: 'Timber',
          demandWind: 100,
          demandEQ: 100,
          lines: [
            { id: uuidv4(), name: 'BL-1', externalWallLength: 0, members: [createDefaultMember('BL-1')]  },
            { id: uuidv4(), name: 'BL-2', externalWallLength: 0, members: [createDefaultMember('BL-2')]  },
          ],
        };
        set(state => {
          state.sections[newId] = newSection;
          state.activeSectionId = newId;
        });
      },

      removeSection: (sectionId: string) => {
        set(state => {
          // Remove the section from the main record
          delete state.sections[sectionId];

          // If the deleted section was the active one, update the active ID
          if (state.activeSectionId === sectionId) {
            // Set it to the first available section, or null if no sections are left
            state.activeSectionId = Object.keys(state.sections)[0] || null;
          }
        });
      },

      setActiveSection: (sectionId: string | null) => {
        set({ activeSectionId: sectionId });
      },

      updateSectionDetails: (sectionId, updates) => {
        set(state => {
          const section = state.sections[sectionId];
          if (section) {
            Object.assign(section, updates);
          }
        });
      },

      // --- Line Actions ---

      addBracingLine: (sectionId, index) => {
        set(state => {
          const section = state.sections[sectionId];
          if (section) {
            const lineCount = section.lines.length + 1;
            const defaultMember: BracingMember = { id: uuidv4(), name: `BL-${lineCount}-1`, system: 'GIB', type: 'GS1-N', lengthOrCount: 1.2, height: 2.4 };
            const newLine: BracingLine = {
              id: uuidv4(),
              name: `BL-${lineCount}`,
              externalWallLength: 0,
              members: [defaultMember],
            };
            section.lines.splice(index + 1, 0, newLine);
          }
        });
      },

      removeBracingLine: (sectionId, lineId) => {
        set(state => {
          const section = state.sections[sectionId];
          if (section && section.lines.length > 2) { // Guardrail: must have at least 2 lines
            section.lines = section.lines.filter(line => line.id !== lineId);
          }
        });
      },

      updateBracingLine: (sectionId, lineId, updates) => {
        set(state => {
          const line = state.sections[sectionId]?.lines.find(l => l.id === lineId);
          if (line) {
            Object.assign(line, updates);
          }
        });
      },

      //reorderBracingLines
      reorderBracingLines: (sectionId, startIndex, endIndex) => {
      set(state => {
        const section = state.sections[sectionId];
        if (section) {
          // Ensure endIndex is within the array bounds
          const finalEndIndex = Math.max(0, Math.min(section.lines.length - 1, endIndex));
          const [removed] = section.lines.splice(startIndex, 1);
          section.lines.splice(finalEndIndex, 0, removed);
        }
      });
    },

      // --- Member Actions ---

      addBracingMember: (sectionId, lineId, index) => {
        set(state => {
          const line = state.sections[sectionId]?.lines.find(l => l.id === lineId);
          if (line) {
            const lineName = line.name
            const memberCount = line.members.length + 1;
            const newMember: BracingMember = {
              id: uuidv4(),
              name: `${lineName}-${memberCount}`,
              system: 'GIB',
              type: 'GS1-N',
              lengthOrCount: 1.2,
              height: 2.4, // Consider pulling from level height
            };
            line.members.splice(index + 1, 0, newMember);
          }
        });
      },

      removeBracingMember: (sectionId, lineId, memberId) => {
        set(state => {
          const line = state.sections[sectionId]?.lines.find(l => l.id === lineId);
          if (line && line.members.length > 1) { // Guardrail: must have at least 1 member
            line.members = line.members.filter(m => m.id !== memberId);
          }
        });
      },

      updateBracingMember: (sectionId, lineId, memberId, updates) => {
        set(state => {
          const member = state.sections[sectionId]?.lines
            .find(l => l.id === lineId)?.members
            .find(m => m.id === memberId);
          
          if (member) {
            Object.assign(member, updates);

            // If the system changed, reset the type to the first available for that system
            if (updates.system) {
              const newSystemData = get().bracingSystems.find(s => s.name === updates.system);
              member.type = newSystemData?.types[0]?.name || '';
            }
          }
        });
      },

      resetSectionDemands: (sectionId: string) => {
      set(state => {
        const section = state.sections[sectionId];
        if (!section) return;

        const { seismicActions, windActionsNS, windActionsEW } = get();
        
        const eqAction = seismicActions.find(a => a.levelId === section.levelId);
        const windActions = section.direction === 'NS' ? windActionsNS : windActionsEW;
        const windAction = windActions.find(a => a.levelId === section.levelId);

        // Update the demands with the calculated values
        section.demandWind = Math.round((windAction?.shear !== undefined ? windAction.shear * 20 : section.demandWind));
        section.demandEQ = Math.round((eqAction?.shear !== undefined ? eqAction.shear*20 : section.demandEQ));
      });
      },
    },
});