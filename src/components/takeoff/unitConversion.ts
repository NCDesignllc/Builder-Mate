import type { TakeoffScale } from "./types";

/**
 * Unit conversion utilities for measurements
 */

export type UnitType = "ft" | "in" | "m" | "cm";

// Conversion factors to feet (base unit)
const TO_FEET: Record<UnitType, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  cm: 0.0328084,
};

// Conversion factors from feet
const FROM_FEET: Record<UnitType, number> = {
  ft: 1,
  in: 12,
  m: 0.3048,
  cm: 30.48,
};

/**
 * Convert a value from one unit to another
 */
export function convertUnits(value: number, fromUnit: UnitType, toUnit: UnitType): number {
  if (fromUnit === toUnit) return value;
  
  // Convert to feet first, then to target unit
  const inFeet = value * TO_FEET[fromUnit];
  return inFeet * FROM_FEET[toUnit];
}

/**
 * Convert a TakeoffScale to a different unit
 */
export function convertScale(scale: TakeoffScale, toUnit: UnitType): TakeoffScale {
  if (scale.unit === toUnit) return scale;
  
  // pxPerUnit needs to be adjusted
  // If we had 100 px per foot, and we want px per inch, we need 100/12 px per inch
  const conversionFactor = FROM_FEET[toUnit] / FROM_FEET[scale.unit];
  
  return {
    pxPerUnit: scale.pxPerUnit * conversionFactor,
    unit: toUnit,
    label: scale.label, // Keep original label
  };
}

/**
 * Format a measurement value with its unit
 */
export function formatMeasurement(value: number, unit: UnitType, decimals: number = 2): string {
  if (unit === "ft" || unit === "in") {
    // For imperial, optionally format as feet and inches
    if (unit === "ft") {
      const feet = Math.floor(value);
      const inches = Math.round((value - feet) * 12);
      
      if (inches === 0) {
        return `${feet}'`;
      } else if (feet === 0) {
        return `${inches}"`;
      } else {
        return `${feet}' ${inches}"`;
      }
    }
  }
  
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Format an area value with its unit
 */
export function formatArea(value: number, unit: UnitType, decimals: number = 2): string {
  return `${value.toFixed(decimals)} ${unit}²`;
}

/**
 * Check if units are compatible (both imperial or both metric)
 */
export function areUnitsCompatible(unit1: UnitType, unit2: UnitType): boolean {
  const imperial = ["ft", "in"];
  const metric = ["m", "cm"];
  
  return (
    (imperial.includes(unit1) && imperial.includes(unit2)) ||
    (metric.includes(unit1) && metric.includes(unit2))
  );
}

/**
 * Get the default unit for a unit system
 */
export function getDefaultUnit(system: "imperial" | "metric"): UnitType {
  return system === "imperial" ? "ft" : "m";
}
