/**
 * OrbitalPath - Keplerian orbital mechanics for elliptical orbits
 *
 * Implements Kepler's laws for realistic orbital motion:
 * - Objects move on elliptical paths
 * - Objects move faster when closer to the center (periapsis)
 * - Orbital period squared is proportional to semi-major axis cubed
 */

export interface OrbitalParams {
  semiMajorAxis: number;    // a: orbit size (pixels)
  eccentricity: number;     // e: 0 (circle) to 0.9 (highly elliptical)
  period: number;           // Orbital period in milliseconds
  phase: number;            // Starting angle in degrees (0-360)
  inclination?: number;     // 3D tilt angle in degrees (0-90)
  argumentOfPeriapsis?: number; // Rotation of ellipse in degrees (0-360)
}

export interface OrbitalPosition {
  x: number;
  y: number;
  velocity: { vx: number; vy: number };
  trueAnomaly: number;      // Current angle in orbit (degrees)
}

/**
 * Solve Kepler's equation to find eccentric anomaly
 * Uses Newton-Raphson iteration for numerical solution
 *
 * @param meanAnomaly - Mean anomaly in radians
 * @param eccentricity - Orbital eccentricity (0-1)
 * @param tolerance - Convergence tolerance
 * @returns Eccentric anomaly in radians
 */
function solveKeplerEquation(
  meanAnomaly: number,
  eccentricity: number,
  tolerance: number = 1e-6
): number {
  // Initial guess (works well for e < 0.8)
  let E = meanAnomaly + eccentricity * Math.sin(meanAnomaly);

  // Newton-Raphson iteration
  let delta = 1;
  let iterations = 0;
  const maxIterations = 20;

  while (Math.abs(delta) > tolerance && iterations < maxIterations) {
    delta = E - eccentricity * Math.sin(E) - meanAnomaly;
    E = E - delta / (1 - eccentricity * Math.cos(E));
    iterations++;
  }

  return E;
}

/**
 * Calculate position on elliptical orbit at given time
 *
 * @param params - Orbital parameters
 * @param time - Time in milliseconds since phase=0
 * @param centerX - Center X position on SVG canvas
 * @param centerY - Center Y position on SVG canvas
 * @returns Orbital position and velocity
 *
 * @example
 * const orbit = {
 *   semiMajorAxis: 100,
 *   eccentricity: 0.3,
 *   period: 5000,
 *   phase: 0
 * };
 * const pos = getOrbitalPosition(orbit, 1250, 200, 200);
 * // Returns position at 1/4 of orbital period
 */
export function getOrbitalPosition(
  params: OrbitalParams,
  time: number,
  centerX: number,
  centerY: number
): OrbitalPosition {
  const {
    semiMajorAxis: a,
    eccentricity: e,
    period,
    phase = 0,
    inclination = 0,
    argumentOfPeriapsis: omega = 0,
  } = params;

  // Calculate mean anomaly (M)
  // M increases linearly with time
  const phaseRad = (phase * Math.PI) / 180;
  const M = ((2 * Math.PI * time) / period + phaseRad) % (2 * Math.PI);

  // Solve Kepler's equation for eccentric anomaly (E)
  const E = solveKeplerEquation(M, e);

  // Calculate true anomaly (ν) from eccentric anomaly
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const sinNu = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const nu = Math.atan2(sinNu, cosNu);

  // Calculate distance from center (r)
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

  // Position in orbital plane
  const x = r * Math.cos(nu);
  const y = r * Math.sin(nu);

  // Apply argument of periapsis rotation (rotate the ellipse)
  const omegaRad = (omega * Math.PI) / 180;
  const xRot = x * Math.cos(omegaRad) - y * Math.sin(omegaRad);
  const yRot = x * Math.sin(omegaRad) + y * Math.cos(omegaRad);

  // Apply inclination (3D effect - compresses Y axis)
  const incRad = (inclination * Math.PI) / 180;
  const yInclined = yRot * Math.cos(incRad);

  // Translate to canvas coordinates
  const finalX = centerX + xRot;
  const finalY = centerY + yInclined;

  // Calculate velocity (useful for motion blur or trails)
  // v = sqrt(GM/a) * sqrt(2/r - 1/a)
  // Simplified: velocity magnitude inversely proportional to distance
  const speedFactor = Math.sqrt(a / r);
  const vAngle = nu + Math.PI / 2; // Velocity perpendicular to radius
  const vx = speedFactor * Math.cos(vAngle) * 10;
  const vy = speedFactor * Math.sin(vAngle) * 10;

  return {
    x: finalX,
    y: finalY,
    velocity: { vx, vy },
    trueAnomaly: (nu * 180) / Math.PI,
  };
}

/**
 * Generate SVG path data for the complete orbit ellipse
 *
 * @param params - Orbital parameters
 * @param centerX - Center X position on SVG canvas
 * @param centerY - Center Y position on SVG canvas
 * @returns SVG path d attribute string
 *
 * @example
 * const orbitPath = generateOrbitPath(orbit, 200, 200);
 * <path d={orbitPath} stroke="white" fill="none" />
 */
export function generateOrbitPath(
  params: OrbitalParams,
  centerX: number,
  centerY: number
): string {
  const {
    semiMajorAxis: a,
    eccentricity: e,
    inclination = 0,
    argumentOfPeriapsis: omega = 0,
  } = params;

  // Calculate semi-minor axis (b)
  const b = a * Math.sqrt(1 - e * e);

  // Calculate focus offset (distance from center to focus)
  const c = a * e;

  // Apply argument of periapsis rotation
  const omegaRad = (omega * Math.PI) / 180;

  // Apply inclination
  const incRad = (inclination * Math.PI) / 180;
  const bInclined = b * Math.cos(incRad);

  // Calculate rotation angle for SVG ellipse
  const rotationDeg = omega;

  // Center of ellipse (offset from focus to center)
  const ellipseCenterX = centerX + c * Math.cos(omegaRad);
  const ellipseCenterY = centerY + c * Math.sin(omegaRad) * Math.cos(incRad);

  // Generate SVG path using ellipse
  // Using path instead of <ellipse> for better control
  return `
    M ${ellipseCenterX - a * Math.cos(omegaRad)},${ellipseCenterY - a * Math.sin(omegaRad) * Math.cos(incRad)}
    A ${a},${bInclined} ${rotationDeg} 0 1 ${ellipseCenterX + a * Math.cos(omegaRad)},${ellipseCenterY + a * Math.sin(omegaRad) * Math.cos(incRad)}
    A ${a},${bInclined} ${rotationDeg} 0 1 ${ellipseCenterX - a * Math.cos(omegaRad)},${ellipseCenterY - a * Math.sin(omegaRad) * Math.cos(incRad)}
  `.trim();
}

/**
 * Create multiple concentric orbits with increasing periods (Kepler's 3rd law)
 *
 * @param baseParams - Base orbital parameters
 * @param count - Number of orbits to generate
 * @param spacing - Distance between orbits
 * @returns Array of orbital parameters
 *
 * @example
 * const orbits = generateConcentricOrbits(
 *   { semiMajorAxis: 50, eccentricity: 0.1, period: 3000, phase: 0 },
 *   5,
 *   30
 * );
 * // Returns 5 orbits with radii 50, 80, 110, 140, 170
 * // Periods follow Kepler's 3rd law: T² ∝ a³
 */
export function generateConcentricOrbits(
  baseParams: OrbitalParams,
  count: number,
  spacing: number
): OrbitalParams[] {
  const orbits: OrbitalParams[] = [];

  for (let i = 0; i < count; i++) {
    const a = baseParams.semiMajorAxis + i * spacing;

    // Kepler's 3rd law: T² ∝ a³
    // T2 / T1 = (a2 / a1)^(3/2)
    const periodRatio = Math.pow(a / baseParams.semiMajorAxis, 1.5);
    const period = baseParams.period * periodRatio;

    orbits.push({
      semiMajorAxis: a,
      eccentricity: baseParams.eccentricity,
      period,
      phase: (baseParams.phase + i * 60) % 360, // Stagger phases
      inclination: baseParams.inclination,
      argumentOfPeriapsis: baseParams.argumentOfPeriapsis,
    });
  }

  return orbits;
}

/**
 * Calculate orbital period from semi-major axis using Kepler's 3rd law
 *
 * @param semiMajorAxis - Semi-major axis in pixels
 * @param basePeriod - Base period for reference orbit (ms)
 * @param baseRadius - Base radius for reference orbit (px)
 * @returns Orbital period in milliseconds
 */
export function calculatePeriod(
  semiMajorAxis: number,
  basePeriod: number = 5000,
  baseRadius: number = 100
): number {
  // T² ∝ a³
  return basePeriod * Math.pow(semiMajorAxis / baseRadius, 1.5);
}

/**
 * Get orbital parameters for predefined orbit types
 */
export const ORBIT_PRESETS = {
  circular: (radius: number, period: number): OrbitalParams => ({
    semiMajorAxis: radius,
    eccentricity: 0,
    period,
    phase: 0,
  }),

  elliptical: (radius: number, period: number): OrbitalParams => ({
    semiMajorAxis: radius,
    eccentricity: 0.3,
    period,
    phase: 0,
  }),

  highlyElliptical: (radius: number, period: number): OrbitalParams => ({
    semiMajorAxis: radius,
    eccentricity: 0.6,
    period,
    phase: 0,
  }),

  inclined: (radius: number, period: number): OrbitalParams => ({
    semiMajorAxis: radius,
    eccentricity: 0.2,
    period,
    phase: 0,
    inclination: 30,
  }),
} as const;
