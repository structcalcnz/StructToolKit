import { z } from 'zod';

// Schemas for the Parts Library
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Category = z.infer<typeof categorySchema>;

export const libraryComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryIds: z.array(z.string()),
  calcType: z.enum(['area', 'solid', 'number']),
  unitWeight: z.number().nullable().optional(),
  defaultParams: z.record(z.string(), z.number()),
  spec: z.string().optional(),
  note: z.string().optional(),
});
export type LibraryComponent = z.infer<typeof libraryComponentSchema>;

export const layerSchema = z.object({
  id: z.string().uuid(),
  libraryComponentId: z.string(), // Links to the LibraryComponent
  name: z.string(),
  params: z.record(z.string(), z.number()),
  weight: z.number().default(0), // Calculated weight in kPa
  isCustom: z.boolean().default(false),
});
export type Layer = z.infer<typeof layerSchema>;

export const partSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  partType: z.enum(['Wall', 'Floor', 'Roof', 'Other']).default('Roof'),
  layers: z.array(layerSchema).default([]),
  totalWeight: z.number().default(0),
  roofSlope: z.number().optional(), // In degrees
});
export type Part = z.infer<typeof partSchema>;


// BUILDING & LEVEL
// Represents a part instance placed on a level
export const levelPartSchema = z.object({
  instanceId: z.string().uuid(),
  name: z.string(),
  // Can be a reference to a full Part, or null for predefined/custom parts
  partId: z.string().uuid().nullable(), 
  partType: z.enum(['Wall', 'Floor', 'Roof', "Other"]),
  // Base weight from the Part or a predefined value
  baseWeight: z.number(), // in kPa

  // Instance-specific geometric parameters
  area: z.number().optional(), // for Floor/Roof
  length: z.number().optional(), // for Wall
  height: z.number().optional(), // for Wall
  openingFactor: z.number().optional(), // for Wall

  // NEW: Load parameters (in kPa)
  liveLoad: z.number().optional(),
  windPressure: z.number().optional(),
});
export type LevelPart = z.infer<typeof levelPartSchema>;

// The Level schema holds its own properties and LevelPart instances
export const levelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  // General level parameters
  storeyHeight: z.number().default(2.4),
  planDimNS: z.number().default(10), // Plan dimension along N-S axis (length of E-W wall)
  planDimEW: z.number().default(10), // Plan dimension along E-W axis (length of N-S wall)
  // Calculated total floor/roof area on this level
  totalArea: z.number().default(0),
  // Array of part instances on this level
  parts: z.array(levelPartSchema).default([]),
  // Calculated total dead load weight for the entire level
  totalLevelWeight: z.number().default(0),
});
export type Level = z.infer<typeof levelSchema>;

const buildingInfoSchema = z.object({
  "Project Name": z.string().default("New Project"),
  "Project Address": z.string().default(""),
  "Project No": z.string().default("S2025-01"),
  "Client": z.string().default("Client"),
  "Designer": z.string().default(""),
  "Date": z.string().default(new Date().toISOString().split("T")[0]),
  "Note": z.string().default(""),
});

export const buildingSchema = z.object({
  id: z.string().uuid(),
  totalArea: z.number().optional(),
  levelIds: z.array(z.string().uuid()),
  buildingInfo: buildingInfoSchema.default({
    "Project Name": "New Project",
    "Project Address": "",
    "Project No": "S2025-01",
    "Client": "Client",
    "Designer": "",
    "Date": new Date().toISOString().split("T")[0],
    "Note": "",
  }),
});
export type Building = z.infer<typeof buildingSchema>;

// ANALYSIS (SEISMIC & WIND)
// Represents a LevelPart instance enriched with seismic-specific parameters.
export const seismicPartInstanceSchema = z.object({
  // identifiers
  instanceId: z.string().uuid(),
  levelId: z.string().uuid(),
  
  // Copied from LevelPart for display
  name: z.string(),
  partType: z.enum(['Wall', 'Floor', 'Roof', 'Other']),
  baseWeight: z.number(),
  liveLoad: z.number().optional(),
  area: z.number().optional(),
  length: z.number().optional(),
  height: z.number().optional(),
  openingFactor: z.number().optional(),
  
  // NEW: Editable seismic-specific deduction factors
  heightFactor: z.number().default(0.5), // For walls
  phi_e: z.number().default(0.3), // Live load combination factor
});
export type SeismicPartInstance = z.infer<typeof seismicPartInstanceSchema>;

// Stores the calculated seismic weight results for a single level.
export const seismicLevelResultSchema = z.object({
  levelId: z.string().uuid(),
  effectiveDL: z.number().default(0), // Wi - Seismic Weight (Dead Load)
  effectiveLL: z.number().default(0), // Seismic Live Load
  lowerHalfWallWeight: z.number().default(0), // Weight to be passed to the level below
});
export type SeismicLevelResult = z.infer<typeof seismicLevelResultSchema>;

// Stores the final seismic actions for a single level.
export const seismicActionSchema = z.object({
  levelId: z.string().uuid(),
  levelName: z.string(),
  effectiveDL: z.number(),
  effectiveLL: z.number(),
  storeyHeight: z.number(),
  heightFromGround: z.number(), // hi
  seismicForce: z.number(), // Fi
  shear: z.number(), // Vi
});
export type SeismicAction = z.infer<typeof seismicActionSchema>;

export const seismicResultSchema = z.object({
    levelId: z.string().uuid(),
    DL: z.number().default(0),
    LL: z.number().default(0),
    importanceLevel: z.string().default(''),
    siteClass: z.string().default(''),
    eqZone: z.string().default(''),
    shear: z.number().default(0),
});
export type SeismicResult = z.infer<typeof seismicResultSchema>;

// Stores the final wind actions for a single level.
export const windActionSchema = z.object({
  levelId: z.string().uuid(),
  levelName: z.string(),
  effectiveRoofArea: z.number(),
  effectiveWallArea: z.number(),
  windForce: z.number(), // Fwi
  shear: z.number(),
  warning: z.string().optional(), // NEW: For UI alerts like "missed roof"
});
export type WindAction = z.infer<typeof windActionSchema>;

// BRACING
// Represents a single member/row in a bracing line
export const bracingMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // User-defined label
  system: z.string(),
  type: z.string(),
  lengthOrCount: z.number(),
  height: z.number(),
});
export type BracingMember = z.infer<typeof bracingMemberSchema>;

// NEW: Represents a single bracing line
export const bracingLineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // e.g., "BL-1"
  externalWallLength: z.number().default(0),
  members: z.array(bracingMemberSchema),
});
export type BracingLine = z.infer<typeof bracingLineSchema>;

// NEW: Represents a complete bracing design section (e.g., Level 1 - NS)
export const bracingSectionSchema = z.object({
  id: z.string().uuid(),
  levelId: z.string().uuid(),
  direction: z.enum(['NS', 'EW']),
  name: z.string(),
  floorType: z.enum(['Timber', 'Concrete']),
  demandWind: z.number().default(0),
  demandEQ: z.number().default(0),
  lines: z.array(bracingLineSchema),
});
export type BracingSection = z.infer<typeof bracingSectionSchema>;