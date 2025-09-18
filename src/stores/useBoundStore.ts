import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { createProjectSlice, type ProjectSlice } from './slices/projectSlice';
import { createPartsSlice, type PartsSlice } from './slices/partsSlice';
import { createLevelsSlice, type LevelsSlice } from './slices/levelsSlice';
import { createAnalysisSlice, type AnalysisSlice } from './slices/analysisSlice';
import { createBracingSlice, type BracingSlice } from './slices/bracingSlice';

// Combine all slice types
type BoundState = ProjectSlice & PartsSlice & LevelsSlice & AnalysisSlice & BracingSlice;

export const useBoundStore = create<BoundState>()(
  immer((set, get, store) => {
    const projectSlice = createProjectSlice(set, get, store);
    const partsSlice = createPartsSlice(set, get, store);
    const levelsSlice = createLevelsSlice(set, get, store);
    const analysisSlice = createAnalysisSlice(set, get, store);
    const bracingSlice = createBracingSlice(set, get, store);

    return {
      // merge top-level state properties
      ...projectSlice,
      ...partsSlice,
      ...levelsSlice,
      ...analysisSlice,
      ...bracingSlice,

      // merge actions manually to avoid overwrite
      actions: {
        ...projectSlice.actions,
        ...partsSlice.actions,
        ...levelsSlice.actions,
        ...analysisSlice.actions,
        ...bracingSlice.actions,
      },
    };
  })
);
