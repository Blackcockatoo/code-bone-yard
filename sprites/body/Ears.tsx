/**
 * Ears - Celestial ears for Auralia Guardian with various geometric shapes
 *
 * Shapes: crescent-moon, star-pointed, pentagon, triangle, spiral
 */

import React, { useMemo } from 'react';
import type { GuardianForm } from '@/guardian/forms';

export type EarShape = 'crescent-moon' | 'star-pointed' | 'pentagon' | 'triangle' | 'spiral';
export type EarSide = 'left' | 'right';

export interface EarProps {
  shape: EarShape;
  side: EarSide;
  position: { x: number; y: number }; // Attach point on body
  size?: number;                       // Base size multiplier (default 1)
  rotation?: number;                   // Additional rotation in degrees
  form: GuardianForm;
  curiosity: number;                   // 0-100 (affects rotation)
  bond: number;                        // 0-100 (affects glow)
  animated?: boolean;                  // Enable idle animation
  time?: number;                       // Animation time in ms
}

export function Ears({
  shape,
  side,
  position,
  size = 1,
  rotation = 0,
  form,
  curiosity,
  bond,
  animated = true,
  time = 0,
}: EarProps): JSX.Element | null {
  // Calculate ear rotation based on curiosity (perk up when curious)
  const baseRotation = side === 'left' ? -15 : 15; // Base tilt
  const curiosityRotation = (curiosity / 100) * 10; // 0-10 degrees forward when curious
  const animationRotation = animated ? Math.sin(time * 0.001) * 3 : 0; // Gentle wiggle

  // Micro-twitch calculation - independent random ear movements (more visible)
  // Uses time-based pseudo-random to create occasional twitches
  const twitchCycle = useMemo(() => {
    // Each ear gets a different twitch cycle offset based on side
    const offset = side === 'left' ? 0 : 1500;
    // Twitch cycle period: 2-3 seconds (more frequent for visibility)
    const baseCycle = 2000 + (side === 'left' ? 500 : -300);
    return { offset, baseCycle };
  }, [side]);

  // Calculate twitch rotation based on time
  const twitchRotation = useMemo(() => {
    if (!animated) return 0;

    // Determine if we're in a twitch window
    const adjustedTime = time + twitchCycle.offset;
    const cyclePosition = adjustedTime % twitchCycle.baseCycle;

    // Twitch occurs for ~300ms every cycle
    if (cyclePosition < 300) {
      // Quick rotation (10-15 degrees) with ease-out - more visible
      const twitchProgress = cyclePosition / 300;
      const twitchAmount = 12 + (curiosity / 100) * 5; // Increased twitch amount
      // Ease-out: fast start, slow settle
      const easeOut = 1 - Math.pow(twitchProgress, 2);
      return twitchAmount * easeOut * (side === 'left' ? 1 : -1);
    }

    return 0;
  }, [animated, time, twitchCycle, curiosity, side]);

  const totalRotation = baseRotation + curiosityRotation + rotation + animationRotation + twitchRotation;

  // Size modulation
  const baseSize = 25 * size;

  // Colors
  const fillColor = form.baseColor;
  const accentColor = form.primaryGold;
  const glowColor = form.glowColor;
  const glowIntensity = bond / 100;

  // Pre-calculate spiral path (MUST be at top level before any conditional returns)
  const spiralPath = useMemo(() => {
    const turns = 2.5;
    const maxRadius = baseSize;
    const points: string[] = [];

    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const angle = t * turns * 2 * Math.PI;
      const radius = t * maxRadius;
      const x = position.x + Math.cos(angle) * radius;
      const y = position.y + Math.sin(angle) * radius;

      if (i === 0) {
        points.push(`M ${x},${y}`);
      } else {
        points.push(`L ${x},${y}`);
      }
    }

    return points.join(' ');
  }, [baseSize, position]);

  // Crescent moon shape
  if (shape === 'crescent-moon') {
    const outerRadius = baseSize;
    const innerRadius = baseSize * 0.6;
    const offset = baseSize * 0.3;

    // Generate crescent path using two circles
    const pathData = `
      M ${position.x},${position.y - outerRadius}
      A ${outerRadius},${outerRadius} 0 1 1 ${position.x},${position.y + outerRadius}
      A ${innerRadius},${innerRadius} 0 1 0 ${position.x},${position.y - outerRadius}
      Z
    `;

    return (
      <g
        className={`guardian-ear crescent-moon ${side}`}
        transform={`rotate(${totalRotation} ${position.x} ${position.y})`}
      >
        {/* Glow */}
        {bond > 50 && (
          <path
            d={pathData}
            fill={glowColor}
            opacity={glowIntensity * 0.4}
            style={{
              filter: 'blur(6px)',
            }}
          />
        )}

        {/* Main shape */}
        <path
          d={pathData}
          fill={fillColor}
          opacity={0.9}
          stroke={accentColor}
          strokeWidth={2}
          style={{
            filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.3))',
          }}
        />

        {/* Inner accent */}
        <circle
          cx={position.x + offset}
          cy={position.y}
          r={4}
          fill={accentColor}
          opacity={0.8}
        />
      </g>
    );
  }

  // Star-pointed shape
  if (shape === 'star-pointed') {
    const points = 5;
    const outerRadius = baseSize;
    const innerRadius = baseSize * 0.5;
    const starPoints: string[] = [];

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = position.x + Math.cos(angle) * radius;
      const y = position.y + Math.sin(angle) * radius;
      starPoints.push(`${x},${y}`);
    }

    return (
      <g
        className={`guardian-ear star-pointed ${side}`}
        transform={`rotate(${totalRotation} ${position.x} ${position.y})`}
      >
        {/* Glow */}
        {bond > 50 && (
          <polygon
            points={starPoints.join(' ')}
            fill={glowColor}
            opacity={glowIntensity * 0.5}
            style={{
              filter: 'blur(8px)',
            }}
          />
        )}

        {/* Main star */}
        <polygon
          points={starPoints.join(' ')}
          fill={fillColor}
          opacity={0.9}
          stroke={accentColor}
          strokeWidth={2}
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
          }}
        />

        {/* Center accent */}
        <circle
          cx={position.x}
          cy={position.y}
          r={6}
          fill={accentColor}
          opacity={0.9}
        />
      </g>
    );
  }

  // Pentagon shape
  if (shape === 'pentagon') {
    const sides = 5;
    const radius = baseSize;
    const pentagonPoints: string[] = [];

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = position.x + Math.cos(angle) * radius;
      const y = position.y + Math.sin(angle) * radius;
      pentagonPoints.push(`${x},${y}`);
    }

    return (
      <g
        className={`guardian-ear pentagon ${side}`}
        transform={`rotate(${totalRotation} ${position.x} ${position.y})`}
      >
        {/* Glow */}
        {bond > 50 && (
          <polygon
            points={pentagonPoints.join(' ')}
            fill={glowColor}
            opacity={glowIntensity * 0.4}
            style={{
              filter: 'blur(6px)',
            }}
          />
        )}

        {/* Main pentagon */}
        <polygon
          points={pentagonPoints.join(' ')}
          fill={fillColor}
          opacity={0.9}
          stroke={accentColor}
          strokeWidth={2}
          style={{
            filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.3))',
          }}
        />

        {/* Inner lines (sacred geometry pattern) */}
        {pentagonPoints.map((_, i) => {
          const p1 = pentagonPoints[i].split(',').map(Number);
          const p2 = pentagonPoints[(i + 2) % sides].split(',').map(Number);

          return (
            <line
              key={`line-${i}`}
              x1={p1[0]}
              y1={p1[1]}
              x2={p2[0]}
              y2={p2[1]}
              stroke={accentColor}
              strokeWidth={1}
              opacity={0.4}
            />
          );
        })}
      </g>
    );
  }

  // Triangle shape
  if (shape === 'triangle') {
    const height = baseSize * 1.5;
    const width = baseSize;

    const trianglePoints = [
      `${position.x},${position.y - height}`,         // Top point
      `${position.x - width / 2},${position.y}`,      // Bottom left
      `${position.x + width / 2},${position.y}`,      // Bottom right
    ];

    return (
      <g
        className={`guardian-ear triangle ${side}`}
        transform={`rotate(${totalRotation} ${position.x} ${position.y})`}
      >
        {/* Glow */}
        {bond > 50 && (
          <polygon
            points={trianglePoints.join(' ')}
            fill={glowColor}
            opacity={glowIntensity * 0.4}
            style={{
              filter: 'blur(6px)',
            }}
          />
        )}

        {/* Main triangle */}
        <polygon
          points={trianglePoints.join(' ')}
          fill={fillColor}
          opacity={0.9}
          stroke={accentColor}
          strokeWidth={2}
          strokeLinejoin="round"
          style={{
            filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.3))',
          }}
        />

        {/* Inner accent circle */}
        <circle
          cx={position.x}
          cy={position.y - height / 3}
          r={4}
          fill={accentColor}
          opacity={0.8}
        />
      </g>
    );
  }

  // Spiral shape
  if (shape === 'spiral') {

    return (
      <g
        className={`guardian-ear spiral ${side}`}
        transform={`rotate(${totalRotation} ${position.x} ${position.y})`}
      >
        {/* Glow */}
        {bond > 50 && (
          <path
            d={spiralPath}
            fill="none"
            stroke={glowColor}
            strokeWidth={8}
            opacity={glowIntensity * 0.4}
            style={{
              filter: 'blur(6px)',
            }}
            strokeLinecap="round"
          />
        )}

        {/* Main spiral */}
        <path
          d={spiralPath}
          fill="none"
          stroke={accentColor}
          strokeWidth={4}
          opacity={0.9}
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
          }}
          strokeLinecap="round"
        />

        {/* Inner spiral fill */}
        <path
          d={spiralPath}
          fill="none"
          stroke={fillColor}
          strokeWidth={2}
          opacity={0.7}
          strokeLinecap="round"
        />

        {/* Center point */}
        <circle
          cx={position.x}
          cy={position.y}
          r={5}
          fill={accentColor}
          opacity={0.9}
          style={{
            filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.4))',
          }}
        />
      </g>
    );
  }

  return null;
}
