import type { BracingMember, BracingSection } from '@/types';
import bracingData from '@/data/bracingData.json';

type BracingSystems = typeof bracingData.systems;

// Helper to find the best matching key (e.g., '1.2' for a length of 1.5)
const getBestMatchKey = (length: number, keys: string[]): string | null => {
  let bestMatch: string | null = null;
  // Ensure keys are numerically sorted
  const sortedKeys = keys.map(parseFloat).sort((a, b) => a - b).map(String);
  for (const key of sortedKeys) {
    if (parseFloat(key) > length) break;
    bestMatch = key;
  }
  return bestMatch;
};

// Calculates the BUs for a single bracing member
export const calculateMemberBUs = (member: BracingMember, systems: BracingSystems, floorType: 'Timber' | 'Concrete') => {
  const system = systems.find(s => s.name === member.system);
  const typeData = system?.types.find(t => t.name === member.type);

  if (!typeData) return { totalWind: 0, totalEQ: 0 };

  const isNumberBased = Object.keys(typeData.wind)[0] === 'n_1';
  const key = isNumberBased ? 'n_1' : getBestMatchKey(member.lengthOrCount, Object.keys(typeData.wind));

  if (!key) return { totalWind: 0, totalEQ: 0 };

  let windRating = (typeData.wind as Record<string, number | undefined>)[key] ?? 0;
  let eqRating = (typeData.eq as Record<string, number | undefined>)[key] ?? 0;

  // Apply floor type limits for length-based systems
  if (!isNumberBased) {
    if (floorType === 'Timber') {
      windRating = Math.min(windRating, 120);
      eqRating = Math.min(eqRating, 120);
    } else { // Concrete
      windRating = Math.min(windRating, 150);
      eqRating = Math.min(eqRating, 150);
    }
  }

  let totalWind = 0;
  let totalEQ = 0;

  if (isNumberBased) {
    totalWind = windRating * member.lengthOrCount;
    totalEQ = eqRating * member.lengthOrCount;
  } else {
    const heightRatio = member.height > 0 ? 2.4 / member.height : 0;
    totalWind = windRating * member.lengthOrCount * heightRatio;
    totalEQ = eqRating * member.lengthOrCount * heightRatio;
  }
  
  return { totalWind, totalEQ };
};

// Calculates the total achieved BUs for an entire section
export const calculateSectionAchievedBUs = (section: BracingSection, systems: BracingSystems) => {
  let achievedWind = 0;
  let achievedEQ = 0;

  section.lines.forEach(line => {
    line.members.forEach(member => {
      const { totalWind, totalEQ } = calculateMemberBUs(member, systems, section.floorType);
      achievedWind += totalWind;
      achievedEQ += totalEQ;
    });
  });

  return { achievedWind, achievedEQ };
};