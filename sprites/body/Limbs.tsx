/**
 * Limbs - Geometric limbs for Auralia Guardian with constellation theming
 *
 * Each limb consists of 3 segments connected by joints, forming a constellation pattern.
 */

import React, { useMemo } from 'react';
import type { GuardianForm } from '@/guardian/forms';

export type LimbType = 'front-left' | 'front-right' | 'back-left' | 'back-right';
export type JointStyle = 'star' | 'circle' | 'glow';

export interface LimbProps {
  type: LimbType;
  position: { x: number; y: number }; // Attach point on body
  segments?: number;                   // Number of segments (default 3)
  length?: number;                     // Base length multiplier (default 1)
  jointStyle?: JointStyle;
  animated?: boolean;                  // Enable idle animation
  form: GuardianForm;
  energy: number;                      // 0-100
  curiosity: number;                   // 0-100
  sigilGlow?: boolean;                 // Glow when sigil activated
  time?: number;                       // Animation time in ms
}

export function Limbs({
  type,
  position,
  segments = 3,
  length = 1,
  jointStyle = 'star',
  animated = true,
  form,
  energy,
  curiosity,
  sigilGlow = false,
  time = 0,
}: LimbProps): JSX.Element {
  // Calculate limb angles and positions based on type
  const limbConfig = useMemo(() => {
    const configs = {
      'front-left': {
        baseAngle: 135,    // Angle from attach point
        bendDirection: -1, // Bend direction
        animationPhase: 0,
      },
      'front-right': {
        baseAngle: 45,
        bendDirection: 1,
        animationPhase: Math.PI,
      },
      'back-left': {
        baseAngle: 225,
        bendDirection: -1,
        animationPhase: Math.PI / 2,
      },
      'back-right': {
        baseAngle: 315,
        bendDirection: 1,
        animationPhase: (3 * Math.PI) / 2,
      },
    };
    return configs[type];
  }, [type]);

  // Calculate segment properties
  const segmentLength = 20 * length;
  const jointSize = sigilGlow ? 8 : 5;

  // Animation: Gentle swaying based on energy and curiosity
  const swayAmplitude = animated ? 5 + (energy / 100) * 10 : 0;
  const swaySpeed = 0.001 + (curiosity / 100) * 0.002;
  const swayOffset = Math.sin(time * swaySpeed + limbConfig.animationPhase) * swayAmplitude;

  // Calculate joint positions for 3-segment limb
  const joints = useMemo(() => {
    const angleRad = ((limbConfig.baseAngle + swayOffset) * Math.PI) / 180;
    const positions: { x: number; y: number }[] = [position]; // Start at attach point

    for (let i = 1; i <= segments; i++) {
      // Each segment bends slightly
      const segmentAngle = angleRad + (i * 0.2 * limbConfig.bendDirection) + (swayOffset * 0.01);
      const prevPos = positions[i - 1];

      positions.push({
        x: prevPos.x + Math.cos(segmentAngle) * segmentLength,
        y: prevPos.y + Math.sin(segmentAngle) * segmentLength,
      });
    }

    return positions;
  }, [position, segments, segmentLength, limbConfig, swayOffset]);

  // Colors from form
  const segmentColor = form.baseColor;
  const jointColor = sigilGlow ? form.secondaryGold : form.primaryGold;
  const glowColor = form.glowColor;
  const lineColor = form.tealAccent;

  return (
    <g className="guardian-limb" data-type={type}>
      {/* Constellation lines connecting joints */}
      {joints.slice(0, -1).map((joint, i) => {
        const nextJoint = joints[i + 1];
        return (
          <line
            key={`line-${i}`}
            x1={joint.x}
            y1={joint.y}
            x2={nextJoint.x}
            y2={nextJoint.y}
            stroke={lineColor}
            strokeWidth={sigilGlow ? 2 : 1}
            strokeDasharray="3,3"
            opacity={0.6}
            style={{
              filter: sigilGlow ? 'drop-shadow(0 0 4px currentColor)' : undefined,
            }}
          />
        );
      })}

      {/* Limb segments (ellipses) */}
      {joints.slice(0, -1).map((joint, i) => {
        const nextJoint = joints[i + 1];
        const midX = (joint.x + nextJoint.x) / 2;
        const midY = (joint.y + nextJoint.y) / 2;
        const angle = Math.atan2(nextJoint.y - joint.y, nextJoint.x - joint.x);
        const width = segmentLength;
        const height = 8 - i * 1.5; // Segments get thinner toward end

        return (
          <ellipse
            key={`segment-${i}`}
            cx={midX}
            cy={midY}
            rx={width / 2}
            ry={height}
            fill={segmentColor}
            opacity={0.85}
            transform={`rotate(${(angle * 180) / Math.PI} ${midX} ${midY})`}
            style={{
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))',
            }}
          />
        );
      })}

      {/* Joints */}
      {joints.map((joint, i) => {
        // Skip the first joint (attach point) as it's part of the body
        if (i === 0) return null;

        if (jointStyle === 'star') {
          // Star-shaped joint
          const points = 5;
          const outerRadius = jointSize;
          const innerRadius = jointSize * 0.5;
          const starPoints: string[] = [];

          for (let p = 0; p < points * 2; p++) {
            const radius = p % 2 === 0 ? outerRadius : innerRadius;
            const angle = (p * Math.PI) / points - Math.PI / 2;
            const x = joint.x + Math.cos(angle) * radius;
            const y = joint.y + Math.sin(angle) * radius;
            starPoints.push(`${x},${y}`);
          }

          return (
            <React.Fragment key={`joint-${i}`}>
              {sigilGlow && (
                <polygon
                  points={starPoints.join(' ')}
                  fill={glowColor}
                  opacity={0.4}
                  style={{
                    filter: 'blur(6px)',
                  }}
                />
              )}
              <polygon
                points={starPoints.join(' ')}
                fill={jointColor}
                opacity={0.9}
                style={{
                  filter: sigilGlow
                    ? 'drop-shadow(0 0 6px currentColor)'
                    : 'drop-shadow(0 0 2px rgba(0,0,0,0.4))',
                }}
              />
            </React.Fragment>
          );
        } else if (jointStyle === 'circle') {
          // Circular joint
          return (
            <React.Fragment key={`joint-${i}`}>
              {sigilGlow && (
                <circle
                  cx={joint.x}
                  cy={joint.y}
                  r={jointSize * 1.5}
                  fill={glowColor}
                  opacity={0.4}
                  style={{
                    filter: 'blur(6px)',
                  }}
                />
              )}
              <circle
                cx={joint.x}
                cy={joint.y}
                r={jointSize}
                fill={jointColor}
                opacity={0.9}
                style={{
                  filter: sigilGlow
                    ? 'drop-shadow(0 0 6px currentColor)'
                    : 'drop-shadow(0 0 2px rgba(0,0,0,0.4))',
                }}
              />
            </React.Fragment>
          );
        } else {
          // Glow style (just glowing circles)
          return (
            <circle
              key={`joint-${i}`}
              cx={joint.x}
              cy={joint.y}
              r={jointSize}
              fill={jointColor}
              opacity={sigilGlow ? 0.9 : 0.7}
              style={{
                filter: `blur(${sigilGlow ? 4 : 2}px) drop-shadow(0 0 8px currentColor)`,
              }}
            />
          );
        }
      })}

      {/* Sparkles on end joint when high energy */}
      {energy > 70 && joints.length > 0 && (
        <circle
          cx={joints[joints.length - 1].x}
          cy={joints[joints.length - 1].y}
          r={3}
          fill={form.secondaryGold}
          opacity={0.6 + Math.sin(time * 0.005) * 0.3}
          style={{
            filter: 'blur(1px)',
          }}
        />
      )}
    </g>
  );
}
