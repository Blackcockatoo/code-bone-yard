/**
 * Tail - Celestial tail for Auralia Guardian with multiple visual styles
 *
 * Styles: constellation, comet, aurora, galaxy-spiral
 */

import React, { useMemo } from 'react';
import type { GuardianForm } from '@/guardian/forms';

export type TailStyle = 'constellation' | 'comet' | 'aurora' | 'galaxy-spiral';

export interface TailProps {
  style: TailStyle;
  position: { x: number; y: number }; // Attach point on body
  segments?: number;                   // Number of tail segments (7-12)
  length?: number;                     // Base length multiplier (default 1)
  flowIntensity?: number;              // How much it sways (0-1)
  form: GuardianForm;
  energy: number;                      // 0-100
  curiosity: number;                   // 0-100
  bond: number;                        // 0-100
  time?: number;                       // Animation time in ms
}

export function Tail({
  style,
  position,
  segments = 8,
  length = 1,
  flowIntensity = 0.5,
  form,
  energy,
  curiosity,
  bond,
  time = 0,
}: TailProps): JSX.Element | null {
  // Base angle points downward
  const baseAngle = 225; // degrees (pointing down-left)

  // Calculate tail segment positions with sinusoidal sway
  const tailPoints = useMemo(() => {
    const segmentLength = (12 + energy / 10) * length;
    const points: { x: number; y: number; size: number }[] = [];

    // Sway parameters
    const swaySpeed = 0.002 + (curiosity / 100) * 0.003;
    const swayAmplitude = 15 * flowIntensity + (energy / 100) * 20;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;

      // Calculate sway offset (sinusoidal wave along tail)
      const swayPhase = time * swaySpeed + i * 0.5;
      const swayX = Math.sin(swayPhase) * swayAmplitude * t;
      const swayY = Math.cos(swayPhase * 0.5) * swayAmplitude * t * 0.3;

      // Base position following angle
      const angleRad = (baseAngle * Math.PI) / 180;
      const baseX = position.x + Math.cos(angleRad) * segmentLength * i;
      const baseY = position.y + Math.sin(angleRad) * segmentLength * i;

      // Apply sway
      const x = baseX + swayX;
      const y = baseY + swayY;

      // Size decreases toward tip
      const size = 12 * (1 - t * 0.7);

      points.push({ x, y, size });
    }

    return points;
  }, [position, segments, length, baseAngle, flowIntensity, energy, curiosity, time]);

  // Generate smooth path through tail points (used by aurora style)
  const pathData = useMemo(() => {
    if (tailPoints.length < 2) return '';

    let path = `M ${tailPoints[0].x},${tailPoints[0].y}`;

    for (let i = 1; i < tailPoints.length; i++) {
      const point = tailPoints[i];
      const prevPoint = tailPoints[i - 1];
      const cpX = (prevPoint.x + point.x) / 2;
      const cpY = (prevPoint.y + point.y) / 2;

      path += ` Q ${cpX},${cpY} ${point.x},${point.y}`;
    }

    return path;
  }, [tailPoints]);

  // Generate spiral points for galaxy style
  const spiralPoints = useMemo(() => {
    const points: { x: number; y: number; size: number; angle: number }[] = [];
    const goldenAngle = 137.5; // Golden angle in degrees

    for (let i = 0; i < segments * 3; i++) {
      const t = i / (segments * 3);
      const baseIdx = Math.floor((t * segments));
      const basePoint = tailPoints[Math.min(baseIdx, tailPoints.length - 1)];

      // Spiral outward using golden angle
      const angle = i * goldenAngle;
      const distance = t * 20;
      const angleRad = (angle * Math.PI) / 180;

      const x = basePoint.x + Math.cos(angleRad) * distance;
      const y = basePoint.y + Math.sin(angleRad) * distance;
      const size = 3 * (1 - t);

      points.push({ x, y, size, angle });
    }

    return points;
  }, [tailPoints, segments]);

  // Render constellation style
  if (style === 'constellation') {
    return (
      <g className="guardian-tail constellation">
        {/* Connecting lines */}
        {tailPoints.slice(0, -1).map((point, i) => {
          const nextPoint = tailPoints[i + 1];
          const opacity = 0.6 * (1 - i / segments);

          return (
            <line
              key={`line-${i}`}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke={form.tealAccent}
              strokeWidth={2}
              strokeDasharray="4,4"
              opacity={opacity}
              style={{
                filter: bond > 50 ? 'drop-shadow(0 0 3px currentColor)' : undefined,
              }}
            />
          );
        })}

        {/* Star points */}
        {tailPoints.map((point, i) => {
          const glowIntensity = (bond / 100) * (1 - i / segments);
          const starPoints = 5;
          const outerRadius = point.size;
          const innerRadius = point.size * 0.5;
          const starPath: string[] = [];

          for (let p = 0; p < starPoints * 2; p++) {
            const radius = p % 2 === 0 ? outerRadius : innerRadius;
            const angle = (p * Math.PI) / starPoints - Math.PI / 2;
            const x = point.x + Math.cos(angle) * radius;
            const y = point.y + Math.sin(angle) * radius;
            starPath.push(`${x},${y}`);
          }

          return (
            <React.Fragment key={`star-${i}`}>
              {bond > 50 && (
                <polygon
                  points={starPath.join(' ')}
                  fill={form.glowColor}
                  opacity={glowIntensity * 0.5}
                  style={{
                    filter: 'blur(4px)',
                  }}
                />
              )}
              <polygon
                points={starPath.join(' ')}
                fill={i % 2 === 0 ? form.primaryGold : form.secondaryGold}
                opacity={0.85 - i / segments * 0.4}
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.4))',
                }}
              />
            </React.Fragment>
          );
        })}
      </g>
    );
  }

  // Render comet style
  if (style === 'comet') {
    return (
      <g className="guardian-tail comet">
        {/* Fading particle trail */}
        {tailPoints.map((point, i) => {
          const t = 1 - i / segments;
          const opacity = t * 0.8;
          const size = point.size * t;

          return (
            <circle
              key={`comet-${i}`}
              cx={point.x}
              cy={point.y}
              r={size}
              fill={form.primaryGold}
              opacity={opacity}
              style={{
                filter: `blur(${2 + i * 0.5}px) drop-shadow(0 0 ${4 + i}px ${form.primaryGold})`,
              }}
            />
          );
        })}

        {/* Bright head */}
        <circle
          cx={tailPoints[0].x}
          cy={tailPoints[0].y}
          r={tailPoints[0].size}
          fill={form.secondaryGold}
          opacity={0.95}
          style={{
            filter: `drop-shadow(0 0 8px ${form.secondaryGold})`,
          }}
        />
      </g>
    );
  }

  // Render aurora style
  if (style === 'aurora') {

    return (
      <g className="guardian-tail aurora">
        {/* Gradient definition */}
        <defs>
          <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={form.primaryGold} stopOpacity={0.9} />
            <stop offset="50%" stopColor={form.secondaryGold} stopOpacity={0.7} />
            <stop offset="100%" stopColor={form.tealAccent} stopOpacity={0.3} />
          </linearGradient>
        </defs>

        {/* Outer glow */}
        <path
          d={pathData}
          stroke="url(#aurora-gradient)"
          strokeWidth={tailPoints[0].size * 2}
          fill="none"
          opacity={0.4}
          strokeLinecap="round"
          style={{
            filter: 'blur(8px)',
          }}
        />

        {/* Main ribbon */}
        <path
          d={pathData}
          stroke="url(#aurora-gradient)"
          strokeWidth={tailPoints[0].size}
          fill="none"
          opacity={0.8}
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 6px currentColor)',
          }}
        />
      </g>
    );
  }

  // Render galaxy-spiral style
  if (style === 'galaxy-spiral') {

    return (
      <g className="guardian-tail galaxy-spiral">
        {/* Central spine */}
        {tailPoints.slice(0, -1).map((point, i) => {
          const nextPoint = tailPoints[i + 1];
          return (
            <line
              key={`spine-${i}`}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke={form.baseColor}
              strokeWidth={point.size}
              opacity={0.6 - i / segments * 0.4}
              strokeLinecap="round"
            />
          );
        })}

        {/* Spiral stars */}
        {spiralPoints.map((point, i) => {
          const opacity = 0.7 * (1 - i / spiralPoints.length);
          const brightness = Math.sin(time * 0.003 + i * 0.1) * 0.3 + 0.7;

          return (
            <circle
              key={`spiral-${i}`}
              cx={point.x}
              cy={point.y}
              r={point.size}
              fill={i % 3 === 0 ? form.primaryGold : form.tealAccent}
              opacity={opacity * brightness}
              style={{
                filter: 'blur(1px) drop-shadow(0 0 2px currentColor)',
              }}
            />
          );
        })}
      </g>
    );
  }

  return null;
}
