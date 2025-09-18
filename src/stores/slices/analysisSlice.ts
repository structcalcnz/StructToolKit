import type { StateCreator } from 'zustand';
import type { SeismicPartInstance, SeismicLevelResult, SeismicAction } from '@/types';
import type { LevelsSlice } from './levelsSlice'; // For cross-slice data access
import type { Part } from '@/types';
import type { WindAction } from '@/types';
import windLookups from '@/data/windLookups.json';
import lookups from '@/data/seismicLookups.json';

// --- HELPER FOR Cht LOOKUP ---
const getCht = (T1: number, subsoil: keyof Omit<typeof lookups.chtValues, 'periods'>): number => {
    const { periods, ...rest } = lookups.chtValues;
    const values = rest as Record<'A' | 'B' | 'C' | 'D' | 'E', number[]>;
    const siteValues = values[subsoil];

    if (T1 >= periods[periods.length - 1]) return siteValues[siteValues.length - 1];
    if (T1 <= periods[0]) return siteValues[0];

    const upperIndex = periods.findIndex(p => p >= T1);
    const lowerIndex = upperIndex - 1;
    
    const T_lower = periods[lowerIndex];
    const T_upper = periods[upperIndex];
    const C_lower = siteValues[lowerIndex];
    const C_upper = siteValues[upperIndex];

    // Linear interpolation
    return C_lower + ( (T1 - T_lower) / (T_upper - T_lower) ) * (C_upper - C_lower);
};

// Helper function for Cpe,r,h interpolation
const interpolateCperh = (height: number): number => {
  const points = windLookups.nzs3604.cperh;
  if (height <= points[0].h) return points[0].val;
  if (height >= points[points.length - 1].h) return points[points.length - 1].val;

  const upperIndex = points.findIndex(p => p.h >= height);
  const lowerIndex = upperIndex - 1;

  const h_lower = points[lowerIndex].h;
  const h_upper = points[upperIndex].h;
  const val_lower = points[lowerIndex].val;
  const val_upper = points[upperIndex].val;

  // Linear interpolation
  return val_lower + ((height - h_lower) / (h_upper - h_lower)) * (val_upper - val_lower);
};


// ---  HELPER FUNCTIONS FOR NZS 1170.2 LOOKUPS ---
const getCpwl = (alpha: number, db: number): number => {
  const table = windLookups.nzs1170.cpwl;
  const row = table.find(r => alpha < r.max_alpha);
  if (!row) return -0.5; // Default or fallback

  const condition = row.conditions.find(c => db <= c.max_db);
  return condition ? condition.val : row.conditions[row.conditions.length - 1].val;
};

const getCpr = (alpha: number, hd: number): number => {
  if (alpha >= 45) {
    const alphaRad = alpha * (Math.PI / 180);
    return -0.8 * Math.sin(alphaRad) - 0.9;
  }
  const table = windLookups.nzs1170.cpr;
  const row = table.find(r => alpha <= r.max_alpha);
  if (!row) return -1.0; // Default or fallback

  const condition = row.conditions.find(c => hd <= c.max_hd);
  return condition ? condition.val : row.conditions[row.conditions.length - 1].val;
};

// Type for our intermediate calculated factors
type SeismicCalculatedFactors = {
  Cht: number;
  returnPeriod: number;
  Z: number;
  Ru: number;
  ZRu: number;
  CT: number;
  CTs: number;
  Mzeta: number;
  Sp: number;
  k_mu: number;
  CdT1: number;
  CdT1_sls: number;
};

export interface AnalysisSlice {
  // State for seismic-specific instances and results
  seismicInstances: Record<string, SeismicPartInstance>; // Normalized by instanceId
  seismicLevelResults: Record<string, SeismicLevelResult>; // Normalized by levelId
  applyAreaFactor: boolean; 

  // State for Seismic Design Inputs
  seismicDesignInputs: {
    subsoilClass: 'A' | 'B' | 'C' | 'D' | 'E';
    t1: number;
    importanceLevel: '1' | '2' | '3' | '4';
    designLife: '6 months' | '5 years' | '25 years' | '50 years' | '100 years';
    town: string;
    useCustomZ: boolean;
    customZ: number;
    rs: number;
    nearFaultFactor: number;
    mu: number;
    zeta: number;
  };
    
  // State for final results
  seismicCalculatedFactors: SeismicCalculatedFactors;
  seismicActions: SeismicAction[];
  isWeightResultsStale: boolean;
  isActionResultsStale: boolean; 

  windInputs: {
    alpha: number;
    isEWGable: boolean;
    isNSGable: boolean;
    useNZS1170: boolean;
    nzs3604Zone: keyof typeof windLookups.nzs3604.zones;
    v_ns: number;
    v_ew: number;
    kc: number;
    pressureSource: 'NZS3604' | 'NZS1170' | 'Max';
  };
  // windCalculatedFactors will now hold our results
  windCalculatedFactors: {
    // nzs3604 results
    nzs3604_p_cfig?: number;
    nzs3604_cperh?: number;
    nzs3604_pr?: number; // pressure on roof
    nzs3604_pw?: number; // pressure on wall
    // nzs1170 results
    h?: number; // building height
    ns_min?: number; ns_max?: number;
    ew_min?: number; ew_max?: number;
    // NS Direction
    db_ns?: number; hd_ns?: number;
    cpwl_ns?: number; cpr_ns?: number;
    pw_ns?: number; pr_ns?: number;
    // EW Direction
    db_ew?: number; hd_ew?: number;
    cpwl_ew?: number; cpr_ew?: number;
    pw_ew?: number; pr_ew?: number;
  };
  windActionsNS: WindAction[];
  windActionsEW: WindAction[];
  isWindResultsStale: boolean;

  actions: {
    // Syncs the analysis state with the current geometry from levelsSlice
    syncSeismicDataWithGeometry: () => void;
    // Updates a single parameter on a seismic instance
    updateSeismicInstanceParam: (
      instanceId: string,
      param: keyof Pick<SeismicPartInstance, 'heightFactor' | 'phi_e' | 'liveLoad'>,
      value: number
    ) => void;
    // The main calculation logic
    calculateSeismicWeights: () => void;
    toggleApplyAreaFactor: (apply: boolean) => void;

    updateSeismicDesignInput: (key: keyof AnalysisSlice['seismicDesignInputs'], value: any) => void;
    calculateSeismicActions: () => void;
    // Wind Actions
    updateWindInput: (key: keyof AnalysisSlice['windInputs'], value: any) => void;

    calculateWindFactors: () => void;
    //calculateWindPressures: () => void;
    calculateWindActions: () => void;
  };
}

export const createAnalysisSlice: StateCreator<
  AnalysisSlice & LevelsSlice & { parts: Record<string, Part> },
  [['zustand/immer', never]],
  [],
  AnalysisSlice
> = (set, get, store) => ({
  seismicInstances: {},
  seismicLevelResults: {},
  applyAreaFactor: true,

  seismicDesignInputs: {
    subsoilClass: 'D',
    t1: 0.4,
    importanceLevel: '2',
    designLife: '50 years',
    town: 'Auckland',
    useCustomZ: false,
    customZ: 0.4,
    rs: 0.25,
    nearFaultFactor: 1.0,
    mu: 2.0,
    zeta: 0.05,
  },
    seismicCalculatedFactors: {
    Cht: 0, returnPeriod: 0, Z: 0, Ru: 0, ZRu: 0,
    CT: 0, CTs: 0, Mzeta: 0, Sp: 0, k_mu: 0, CdT1: 0, CdT1_sls: 0,
  },
  seismicActions: [],
  isWeightResultsStale: false,
  isActionResultsStale: false,

  windInputs: {
    alpha: 15,
    isEWGable: false,
    isNSGable: false,
    useNZS1170: false,
    nzs3604Zone: 'Medium',
    v_ns: 37,
    v_ew: 37,
    kc: 0.9,
    pressureSource: 'NZS3604',
  },
  windCalculatedFactors: {},
  windActionsNS: [],
  windActionsEW: [],
  isWindResultsStale: false,

  actions: {
    toggleApplyAreaFactor: (apply) => {
      set({ applyAreaFactor: apply });
      set({isWeightResultsStale: true, isActionResultsStale: true}); // Mark as stale
    },

    syncSeismicDataWithGeometry: () => {
      const { levels, levelOrder } = get();
      const newSeismicInstances: Record<string, SeismicPartInstance> = {};

      levelOrder.forEach(levelId => {
        levels[levelId]?.parts.forEach(partInstance => {
          newSeismicInstances[partInstance.instanceId] = {
            instanceId: partInstance.instanceId,
            levelId: levelId,
            name: partInstance.name,
            partType: partInstance.partType,
            baseWeight: partInstance.baseWeight,
            liveLoad: partInstance.liveLoad,
            area: partInstance.area,
            length: partInstance.length,
            height: partInstance.height,
            openingFactor: partInstance.openingFactor,
            // Default deduction factors
            heightFactor: 0.5,
            phi_e: 0.3,
          };
        });
      });
      set({ seismicInstances: newSeismicInstances, seismicLevelResults: {} }); // Reset results on sync
    },

    updateSeismicInstanceParam: (instanceId, param, value) => {
      set(state => {
        const instance = state.seismicInstances[instanceId];
        if (instance) {
          // handles updates for 'heightFactor', 'phi_e', and now 'liveLoad'
          (instance as any)[param] = value;
          state.isWeightResultsStale = true;
          state.isActionResultsStale = true; // Mark as stale
        }
      });
    },

    // calculateSeismicWeights to respect top-down order
    calculateSeismicWeights: () => {
      const { levelOrder, seismicInstances, applyAreaFactor } = get();
      const newResults: Record<string, SeismicLevelResult> = {};
      let lowerHalfWallWeightFromAbove = 0;

      const reversedLevelOrder = [...levelOrder].reverse();
      for (const levelId of reversedLevelOrder) {
        
        const instancesOnThisLevel = Object.values(seismicInstances).filter(inst => inst.levelId === levelId);

        let levelDL = 0;
        let levelLL = 0;
        let lowerHalfWallWeightOfThisLevel = 0;
        let totalFloorAreaForThisLevel = 0;

        instancesOnThisLevel.forEach(inst => {
          let instanceDL = 0;
          let instanceLL = 0;
          const isWallLike = inst.partType === 'Wall'
          const isPartition = inst.partType === 'Other' && inst.name.toLowerCase().includes('partition');

          // Rule 4: Calculate DL and LL for each instance type
          if (isWallLike) {
            const totalWallDL = (inst.length || 0) * (inst.height || 0) * (inst.openingFactor || 1) * inst.baseWeight;
            instanceDL = totalWallDL * inst.heightFactor;
            lowerHalfWallWeightOfThisLevel += totalWallDL * (1 - inst.heightFactor);
          } else if (isPartition) {
            const totalWallDL = (inst.area || 0) * inst.baseWeight
            instanceDL = totalWallDL* inst.heightFactor;
            lowerHalfWallWeightOfThisLevel += totalWallDL * (1 - inst.heightFactor);
            // instanceLL is 0
          } else if (inst.partType === 'Roof') {
            instanceDL = (inst.area || 0) * inst.baseWeight;
            // instanceLL is 0 for roofs
          } else if (inst.partType === 'Floor') {
            instanceDL = (inst.area || 0) * inst.baseWeight;
            instanceLL = (inst.liveLoad || 0) * (inst.area || 0)*inst.phi_e;
            totalFloorAreaForThisLevel += (inst.area || 0);
          } else { // 'Other' types that are not partitions
            instanceDL = (inst.area || 0) * inst.baseWeight;
            // instanceLL is 0
          }
          levelDL += instanceDL;
          levelLL += instanceLL;
        });

        // Rule 5: Calculate effective LL with reduction factors
        let phi_a = 1.0;
        if (applyAreaFactor && totalFloorAreaForThisLevel > 0) {
          phi_a = 0.3 + 3 / Math.sqrt(totalFloorAreaForThisLevel);
        }

        const effectiveLL = levelLL * phi_a; // Note: phi_e is applied per-instance in the raw LL calculation

        // Rule 5: Summarize the level
        const effectiveDL = levelDL + lowerHalfWallWeightFromAbove;

        newResults[levelId] = {
          levelId,
          effectiveDL,
          effectiveLL,
          lowerHalfWallWeight: lowerHalfWallWeightOfThisLevel,
        };
        
        lowerHalfWallWeightFromAbove = lowerHalfWallWeightOfThisLevel;
      }
      set({ seismicLevelResults: newResults, isWeightResultsStale: false  });
    },

    updateSeismicDesignInput: (key, value) => {
      set(state => {
        (state.seismicDesignInputs as any)[key] = value;
        state.isActionResultsStale = true; // Mark as stale
      });
    },

    // CalculateSeismicActions to respect order, correct formula, and save intermediate results
    calculateSeismicActions: () => {
        const { levels, levelOrder, seismicLevelResults, seismicDesignInputs } = get();

        // Step 1: Site Spectra Calculations
        const { t1, subsoilClass, importanceLevel, designLife, town, useCustomZ, customZ, rs, nearFaultFactor, mu, zeta } = seismicDesignInputs;
        
        const Cht = getCht(t1, subsoilClass);
        const returnPeriod = lookups.returnPeriods[designLife][importanceLevel] || 0;
        const Z = useCustomZ ? customZ : lookups.towns.find(t => t.name === town)?.z || 0;
        const Ru = lookups.ruValues.find(r => r.period === returnPeriod)?.ru || 0;
        
        const ZRu = Math.min(0.7, Z * Ru); //not exceed 0.7
        const CT = Cht * ZRu * nearFaultFactor;
        const CTs = Cht * Z * rs * nearFaultFactor;

        // Step 2: Seismic Coefficients
        const Mzeta = Math.sqrt(7 / (2 + zeta * 100));
        const Sp = mu <= 2 ? 1.3 - 0.3 * mu : 0.7;

        let k_mu;
        if (subsoilClass === 'E' && t1 >= 1.0 || mu < 1.5) {
            k_mu = mu;
        } else if (subsoilClass === 'E' && t1 < 1.0 && mu >= 1.5) {
            k_mu = (mu - 1.5) * t1 / 0.7 + 1.5;
        } else if (t1 >= 0.7) {
            k_mu = mu;
        } else { // subsoil A,B,C,D and T1 < 0.7
            k_mu = (mu - 1) * t1 / 0.7 + 1;
        }

        const CdT1 = Mzeta * (CT * Sp) / k_mu;
        const CdT1_sls = CTs; // For SLS

        // Store intermediate results
        const calculatedFactors = { Cht, returnPeriod, Z, Ru, ZRu, CT, CTs, Mzeta, Sp, k_mu, CdT1, CdT1_sls };
        set({ seismicCalculatedFactors: calculatedFactors });

        // Step 3: Seismic Actions
        const totalWeight = Object.values(seismicLevelResults).reduce((sum, r) => sum + r.effectiveDL + r.effectiveLL, 0);
        const baseShearV = CdT1 * totalWeight;
        const Ft = 0.08 * baseShearV;

        let heightFromGround = 0;
        const levelData = levelOrder.map(levelId => {
            heightFromGround += levels[levelId].storeyHeight;
            return {
                ...seismicLevelResults[levelId],
                levelName: levels[levelId].name,
                storeyHeight: levels[levelId].storeyHeight,
                heightFromGround,
                weight: seismicLevelResults[levelId].effectiveDL + seismicLevelResults[levelId].effectiveLL,
            };
        });

        const sum_Wi_hi = levelData.reduce((sum, level) => sum + level.weight * level.heightFromGround, 0);
        
        //Reverse the data array to iterate from top down for shear accumulation
        const reversedLevelData = [...levelData].reverse();
        let accumulatedShear = 0;
        const newActions: SeismicAction[] = [];

        // Iterate from top down to calculate shear
        reversedLevelData.forEach((level, index) => {
            let Fi = 0;
            if (sum_Wi_hi > 0) {
                Fi = 0.92 * baseShearV * (level.weight * level.heightFromGround) / sum_Wi_hi;
                // Ft is only added to the top-most level
                if (index === 0) {
                    Fi += Ft;
                }
            }
            accumulatedShear += Fi;

            newActions.push({ // Push to the end, as we are already iterating top-down
                levelId: level.levelId,
                levelName: level.levelName,
                effectiveDL: level.effectiveDL,
                effectiveLL: level.effectiveLL,
                storeyHeight: level.storeyHeight,
                heightFromGround: level.heightFromGround,
                seismicForce: Fi,
                shear: accumulatedShear,
            });
        });
        
        set({ seismicActions: newActions, isActionResultsStale: false });
    },
      updateWindInput: (key, value) => {
      set(state => { (state.windInputs as any)[key] = value, 
      state.isWindResultsStale = true; });// Mark as stale on any input change
    },

    // action calculates all intermediate factors and pressures
    calculateWindFactors: () => {
      const { levels, levelOrder, windInputs } = get();
      const factors: AnalysisSlice['windCalculatedFactors'] = {};

      // --- NZS 3604 Calculations ---
      const p_cfig = windLookups.nzs3604.zones[windInputs.nzs3604Zone];
      const Cpe_w = 1.2;

      // Calculate average roof height at the top level
      const topLevelId = [...levelOrder].reverse()[0];
      const topLevel = levels[topLevelId];
      let avgTopRoofHeight = 0;
      if (topLevel) {
          const roofParts = topLevel.parts.filter(p => p.partType === 'Roof');
          if (roofParts.length > 0) {
              const totalRoofArea = roofParts.reduce((sum, p) => sum + (p.area || 0), 0);
              if (totalRoofArea > 0) {
                  const weightedHeightSum = roofParts.reduce((sum, p) => sum + (p.height || 0) * (p.area || 0), 0);
                  avgTopRoofHeight = weightedHeightSum / totalRoofArea;
              }
          }
      }
      
      const cperh = interpolateCperh(avgTopRoofHeight*2);
      const pr = p_cfig * cperh;
      const pw = p_cfig * Cpe_w;
      factors.nzs3604_p_cfig = p_cfig;
      factors.nzs3604_cperh = cperh;
      factors.nzs3604_pr = pr;
      factors.nzs3604_pw = pw;

      // --- NZS 1170.2 Calculations ---
      if (windInputs.useNZS1170 && levelOrder.length > 0) {
        // Building Dimensions
        const allLevels = Object.values(levels);
        const nsDims = allLevels.map(l => l.planDimNS);
        const ewDims = allLevels.map(l => l.planDimEW);
        factors.h = allLevels.reduce((sum, l) => sum + l.storeyHeight, 0);
        factors.ns_min = Math.min(...nsDims); factors.ns_max = Math.max(...nsDims);
        factors.ew_min = Math.min(...ewDims); factors.ew_max = Math.max(...ewDims);

        const { alpha } = windInputs;
        const Cpw_w = 0.7;
        const alphaRad = alpha * (Math.PI / 180);
        const cosAlpha = Math.cos(alphaRad);

        // NS Direction---The wind blows North-to-South.
        if (factors.ns_max > 0 && factors.ew_min > 0) {
          const b_ns = factors.ew_min; // Cross-wind dimension (width of face hit by wind)
          const d_ns = factors.ns_max; // Along-wind dimension (length of building in wind direction)
          factors.db_ns = d_ns / b_ns;
          factors.hd_ns = factors.h / d_ns;
          factors.cpwl_ns = getCpwl(alpha, factors.db_ns);
          factors.cpr_ns = getCpr(alpha, factors.hd_ns);
          factors.pw_ns = 0.6 * Math.pow(windInputs.v_ns, 2) * (Cpw_w - factors.cpwl_ns)/1000;
          factors.pr_ns = -0.6 * Math.pow(windInputs.v_ns, 2) * cosAlpha * factors.cpr_ns/1000;
        }

        // EW Direction---The wind blows East-to-West.
        if (factors.ew_max > 0 && factors.ns_min > 0) {
          const b_ew = factors.ns_min; // Cross-wind dimension
          const d_ew = factors.ew_max; // Along-wind dimension
          factors.db_ew = d_ew / b_ew;
          factors.hd_ew = factors.h / d_ew;
          factors.cpwl_ew = getCpwl(alpha, factors.db_ew);
          factors.cpr_ew = getCpr(alpha, factors.hd_ew);
          factors.pw_ew = 0.6 * Math.pow(windInputs.v_ew, 2) * (Cpw_w - factors.cpwl_ew)/1000;
          factors.pr_ew = -0.6 * Math.pow(windInputs.v_ew, 2) * cosAlpha * factors.cpr_ew/1000;
        }
      }

      set({ windCalculatedFactors: factors });
    },

// NEW: The core logic for the final section
    calculateWindActions: () => {
      const { levels, levelOrder, windInputs, windCalculatedFactors } = get();
      const reversedLevelOrder = [...levelOrder].reverse(); // Top-down iteration
      
      const newActions: { ns: WindAction[], ew: WindAction[] } = { ns: [], ew: [] };

      // Determine which pressures to use
      let pr_ns, pw_ns, pr_ew, pw_ew;
      const { pressureSource } = windInputs;
      const f = windCalculatedFactors;

      if (pressureSource === 'NZS1170') {
        pr_ns = f.pr_ns || 0; pw_ns = f.pw_ns || 0;
        pr_ew = f.pr_ew || 0; pw_ew = f.pw_ew || 0;
      } else if (pressureSource === 'Max') {
        pr_ns = Math.max(f.nzs3604_pr || 0, f.pr_ns || 0); pw_ns = Math.max(f.nzs3604_pw || 0, f.pw_ns || 0);
        pr_ew = Math.max(f.nzs3604_pr || 0, f.pr_ew || 0); pw_ew = Math.max(f.nzs3604_pw || 0, f.pw_ew || 0);
      } else { // Default to NZS3604
        pr_ns = pr_ew = f.nzs3604_pr || 0;
        pw_ns = pw_ew = f.nzs3604_pw || 0;
      }

      // --- Loop for both directions ---
      (['ns', 'ew'] as const).forEach(dir => {
        let accumulatedWallArea = 0;
        let accumulatedShear = 0;

        reversedLevelOrder.forEach((levelId, index) => {
          const level = levels[levelId];
          const levelAbove = index > 0 ? levels[reversedLevelOrder[index - 1]] : null;

          const dim = dir === 'ns' ? level.planDimEW : level.planDimNS; //NS wind impacts on the EW wall
          const dimAbove = dir === 'ns' ? levelAbove?.planDimEW || 0 : levelAbove?.planDimNS || 0;
          const pw = dir === 'ns' ? pw_ns : pw_ew;
          const pr = dir === 'ns' ? pr_ns : pr_ew;
          const isGable = dir === 'ns' ? windInputs.isNSGable : windInputs.isEWGable;

          let Ar = 0, Aw = 0, Fwi = 0, warning: string | undefined;
          

          const dimDelta = dim - dimAbove;

          const roofParts = level.parts.filter(p => p.partType === 'Roof');
          const hasRoof = roofParts.length > 0
          let avgRoofHeight = 0;

          if (roofParts.length > 0) {
            const totalRoofArea = roofParts.reduce((sum, p) => sum + (p.area || 0), 0);
            if (totalRoofArea > 0) {
              const weightedHeightSum = roofParts.reduce((sum, p) => sum + (p.height || 0) * (p.area || 0), 0);
              avgRoofHeight = weightedHeightSum / totalRoofArea;
            }
          }

          if (index === 0) { // Top level
            Ar = avgRoofHeight * dim;
            Aw = 0.5 * level.storeyHeight * dim;
            Fwi = isGable ? pw * (Ar + Aw) : pr * Ar + pw * Aw;
          } else { // Lower levels
            if (dimDelta > 0) {
              if (hasRoof) {
                Ar = avgRoofHeight * dimDelta; // avgRoofHeight for this level
              } else {
                warning = "Roof may be missing for this setback, please check.";
              }
            }
            Aw = accumulatedWallArea + 0.5 * level.storeyHeight * dim;
            Fwi = pw * (Ar + Aw);
          }
          
          const finalFwi = Fwi * windInputs.kc;
          accumulatedShear += finalFwi;
          accumulatedWallArea = Aw;

          const action: WindAction = {
            levelId, levelName: level.name,
            effectiveRoofArea: Ar, effectiveWallArea: Aw,
            windForce: finalFwi, shear: accumulatedShear,
            warning,
          };
          
          if(dir === 'ns') newActions.ns.push(action);
          else newActions.ew.push(action);
        });
      });

      set({ windActionsNS: newActions.ns, windActionsEW: newActions.ew, isWindResultsStale: false });
    },
  },
});