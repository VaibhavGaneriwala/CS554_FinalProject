/**
 * Converts total inches to feet and inches
 * @param totalInches - Total height in inches
 * @returns Object with feet and inches
 */
export const inchesToFeetInches = (totalInches: number): { feet: number; inches: number } => {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

/**
 * Converts feet and inches to total inches
 * @param feet - Height in feet
 * @param inches - Additional inches
 * @returns Total height in inches
 */
export const feetInchesToInches = (feet: number, inches: number): number => {
  return feet * 12 + inches;
};

/**
 * Formats height for display
 * @param totalInches - Total height in inches
 * @returns Formatted string like "5'10""
 */
export const formatHeight = (totalInches: number | undefined): string => {
  if (!totalInches) return 'Not set';
  const { feet, inches } = inchesToFeetInches(totalInches);
  return `${feet}'${inches}"`;
};

