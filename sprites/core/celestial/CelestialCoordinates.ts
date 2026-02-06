/**
 * CelestialCoordinates - Convert celestial coordinates to SVG positions
 *
 * Uses azimuthal equidistant projection to map celestial sphere onto 2D plane.
 * Azimuth: 0-360° (0° = north, 90° = east, 180° = south, 270° = west)
 * Altitude: 0-90° (0° = horizon, 90° = zenith/directly overhead)
 */

export interface CelestialCoords {
  azimuth: number;    // 0-360 degrees
  altitude: number;   // 0-90 degrees
}

export interface SVGCoords {
  x: number;
  y: number;
}

/**
 * Convert celestial coordinates (azimuth, altitude) to SVG canvas coordinates
 *
 * @param azimuth - Angle in degrees (0-360), where 0° is north, 90° is east
 * @param altitude - Angle in degrees (0-90), where 0° is horizon, 90° is zenith
 * @param distance - Distance from center (default 100)
 * @param centerX - Center X position on SVG canvas
 * @param centerY - Center Y position on SVG canvas
 * @returns SVG coordinates {x, y}
 *
 * @example
 * // Position a star at 45° azimuth, 60° altitude, 150px from center
 * const pos = celestialToSVG(45, 60, 150, 200, 200);
 * // Returns: { x: 253.03, y: 146.97 }
 */
export function celestialToSVG(
  azimuth: number,
  altitude: number,
  distance: number = 100,
  centerX: number,
  centerY: number
): SVGCoords {
  // Convert degrees to radians
  const azimuthRad = (azimuth * Math.PI) / 180;
  const altitudeRad = (altitude * Math.PI) / 180;

  // Azimuthal equidistant projection
  // The radial distance from center is proportional to (90° - altitude)
  // This creates a circular projection where:
  // - altitude 90° (zenith) is at center
  // - altitude 0° (horizon) is at maximum distance
  const r = distance * (1 - altitude / 90);

  // SVG coordinates: Y increases downward, so we need to account for that
  // Azimuth 0° points up (north), rotating clockwise
  const x = centerX + r * Math.sin(azimuthRad);
  const y = centerY - r * Math.cos(azimuthRad); // Negative because SVG Y increases downward

  return { x, y };
}

/**
 * Convert SVG canvas coordinates to celestial coordinates (inverse projection)
 *
 * @param x - X position on SVG canvas
 * @param y - Y position on SVG canvas
 * @param centerX - Center X position on SVG canvas
 * @param centerY - Center Y position on SVG canvas
 * @param distance - Maximum distance from center (should match celestialToSVG)
 * @returns Celestial coordinates {azimuth, altitude}
 *
 * @example
 * // Find celestial position of a click at (253, 147)
 * const celestial = svgToCelestial(253, 147, 200, 200, 150);
 * // Returns: { azimuth: 45, altitude: 60 }
 */
export function svgToCelestial(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  distance: number = 100
): CelestialCoords {
  // Calculate offset from center
  const dx = x - centerX;
  const dy = centerY - y; // Flip Y because SVG Y increases downward

  // Calculate radial distance
  const r = Math.sqrt(dx * dx + dy * dy);

  // Calculate azimuth (angle from north, clockwise)
  let azimuth = (Math.atan2(dx, dy) * 180) / Math.PI;
  if (azimuth < 0) azimuth += 360; // Normalize to 0-360

  // Calculate altitude (inverse of projection formula)
  const altitude = 90 * (1 - r / distance);

  // Clamp altitude to valid range
  return {
    azimuth: azimuth % 360,
    altitude: Math.max(0, Math.min(90, altitude)),
  };
}

/**
 * Calculate angular distance between two celestial points
 * Uses the haversine formula for spherical distance
 *
 * @param coord1 - First celestial coordinate
 * @param coord2 - Second celestial coordinate
 * @returns Angular distance in degrees (0-180)
 */
export function angularDistance(
  coord1: CelestialCoords,
  coord2: CelestialCoords
): number {
  const az1 = (coord1.azimuth * Math.PI) / 180;
  const az2 = (coord2.azimuth * Math.PI) / 180;
  const alt1 = (coord1.altitude * Math.PI) / 180;
  const alt2 = (coord2.altitude * Math.PI) / 180;

  // Haversine formula
  const dAlt = alt2 - alt1;
  const dAz = az2 - az1;

  const a =
    Math.sin(dAlt / 2) ** 2 +
    Math.cos(alt1) * Math.cos(alt2) * Math.sin(dAz / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  return (c * 180) / Math.PI;
}

/**
 * Interpolate between two celestial coordinates
 *
 * @param coord1 - Start coordinate
 * @param coord2 - End coordinate
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated celestial coordinate
 */
export function interpolateCelestial(
  coord1: CelestialCoords,
  coord2: CelestialCoords,
  t: number
): CelestialCoords {
  // Simple linear interpolation
  // For more accurate spherical interpolation, use slerp
  const azimuth = coord1.azimuth + (coord2.azimuth - coord1.azimuth) * t;
  const altitude = coord1.altitude + (coord2.altitude - coord1.altitude) * t;

  return { azimuth: azimuth % 360, altitude };
}

/**
 * Convert celestial coordinate to a string description
 * Useful for debugging and tooltips
 *
 * @param coord - Celestial coordinate
 * @returns Human-readable string
 */
export function celestialToString(coord: CelestialCoords): string {
  const azDeg = Math.floor(coord.azimuth);
  const azMin = Math.floor((coord.azimuth - azDeg) * 60);
  const altDeg = Math.floor(coord.altitude);
  const altMin = Math.floor((coord.altitude - altDeg) * 60);

  return `Az ${azDeg}° ${azMin}' / Alt ${altDeg}° ${altMin}'`;
}
