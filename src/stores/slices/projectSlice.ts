import type { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { type Building, buildingSchema } from "@/types";
import {type BoundState} from "../useBoundStore"

type BuildingInfo = z.infer<typeof buildingSchema.shape.buildingInfo>;

export interface ProjectSlice {
  building: Building;
  actions: {
    updateBuildingInfo: (key: keyof BuildingInfo, value: string) => void;
    createNewJob: () => void;
    saveJob: () => void;
    loadJob: (id: string) => void;
  };
}

export const createProjectSlice: StateCreator<
  BoundState,
  [["zustand/immer", never]],
  [],
  ProjectSlice
> = (set) => ({
  building: buildingSchema.parse({
    id: uuidv4(),
    levelIds: [],
  }),
  actions: {
    updateBuildingInfo: (key: keyof BuildingInfo, value: string) => {
      set((state) => {
        state.building.buildingInfo[key] = value;
      });
    },
    createNewJob: () => {
      set({
        building: buildingSchema.parse({
          id: uuidv4(),
          levelIds: [],
        }),
      });
    },
    saveJob: () => {
      console.log("saveJob not implemented yet");
    },
    loadJob: (id: string) => {
      console.log(`loadJob not implemented yet. Requested id=${id}`);
    },
  },
});
