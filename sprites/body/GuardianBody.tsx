/**
 * GuardianBody - Main body ellipse with anchor point system for body parts
 *
 * Extracted from AuraliaMetaPet.tsx and enhanced with anchor points
 * for attaching limbs, tail, ears, and accessories.
 */

import React from 'react';
import type { GuardianForm } from '@/guardian/forms';

export interface BodyAnchorPoint {
  id: string;
  angle: number;  // Degrees around ellipse (0 = top, 90 = right, 180 = bottom, 270 = left)
  offset?: number; // Additional pixel offset from edge
}

export interface GuardianBodyProps {
  centerX: number;
  centerY: number;
  radiusX?: number;
  radiusY?: number;
  form: GuardianForm;
  annoyanceLevel: number;
  bond: number;
  orbDeformation?: {
    scaleX: number;
    scaleY: number;
  };
}

/**
 * Standard body anchor points for attaching body parts
 */
export const BODY_ANCHORS = {
  ears: {
    left: { id: 'ear-left', angle: -30, offset: 0 } as BodyAnchorPoint,
    right: { id: 'ear-right', angle: 30, offset: 0 } as BodyAnchorPoint,
  },
  limbs: {
    frontLeft: { id: 'limb-fl', angle: 150, offset: 5 } as BodyAnchorPoint,
    frontRight: { id: 'limb-fr', angle: 30, offset: 5 } as BodyAnchorPoint,
    backLeft: { id: 'limb-bl', angle: 210, offset: 5 } as BodyAnchorPoint,
    backRight: { id: 'limb-br', angle: -30, offset: 5 } as BodyAnchorPoint,
  },
  tail: { id: 'tail', angle: 225, offset: 0 } as BodyAnchorPoint,
  accessories: {
    crown: { id: 'crown', angle: 0, offset: 10 } as BodyAnchorPoint,
    collar: { id: 'collar', angle: 180, offset: 0 } as BodyAnchorPoint,
  },
};

/**
 * Calculate anchor position on ellipse
 *
 * @param anchor - Anchor point definition
 * @param centerX - Ellipse center X
 * @param centerY - Ellipse center Y
 * @param radiusX - Ellipse radius X
 * @param radiusY - Ellipse radius Y
 * @returns Position {x, y} for anchor point
 */
export function getAnchorPosition(
  anchor: BodyAnchorPoint,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): { x: number; y: number } {
  const radians = (anchor.angle * Math.PI) / 180;

  // Position on ellipse
  const x = centerX + (radiusX + (anchor.offset || 0)) * Math.sin(radians);
  const y = centerY - (radiusY + (anchor.offset || 0)) * Math.cos(radians);

  return { x, y };
}

/**
 * GuardianBody component
 * Renders the main body ellipse with facial features
 */
export function GuardianBody({
  centerX,
  centerY,
  radiusX = 85,
  radiusY = 95,
  form,
  annoyanceLevel,
  bond,
  orbDeformation,
}: GuardianBodyProps): JSX.Element {
  // Apply deformation if provided
  const scaleX = orbDeformation?.scaleX ?? 1;
  const scaleY = orbDeformation?.scaleY ?? 1;
  const actualRadiusX = radiusX * scaleX;
  const actualRadiusY = radiusY * scaleY;

  return (
    <g className="guardian-body">
      {/* Gradient definition */}
      <defs>
        <radialGradient id="guardianBodyGradient" cx="50%" cy="40%">
          <stop offset="0%" stopColor={form.tealAccent} stopOpacity={0.3} />
          <stop offset="50%" stopColor={form.baseColor} stopOpacity={0.9} />
          <stop offset="100%" stopColor={form.baseColor} stopOpacity={1} />
        </radialGradient>

        {/* Guardian glow filter */}
        <filter id="guardianGlow">
          <feGaussianBlur stdDeviation="4" result="glow" />
          <feColorMatrix
            in="glow"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#guardianGlow)">
        {/* Main body - ellipse */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={actualRadiusX}
          ry={actualRadiusY}
          fill="url(#guardianBodyGradient)"
          stroke={form.primaryGold}
          strokeWidth={2}
          opacity={0.9}
        />

        {/* Face area */}
        <ellipse
          cx={centerX}
          cy={centerY - 20}
          rx={50 * scaleX}
          ry={45 * scaleY}
          fill={form.baseColor}
          opacity={0.5}
        />

        {/* Subtle accent marks on sides */}
        <ellipse
          cx={centerX - 45}
          cy={centerY - 10}
          rx={8}
          ry={5}
          fill={form.tealAccent}
          opacity={0.3}
        />
        <ellipse
          cx={centerX + 45}
          cy={centerY - 10}
          rx={8}
          ry={5}
          fill={form.tealAccent}
          opacity={0.3}
        />

        {/* Simple mouth expression */}
        {annoyanceLevel > 50 ? (
          // Grumpy frown
          <path
            d={`M ${centerX - 15} ${centerY + 5} Q ${centerX} ${centerY} ${centerX + 15} ${centerY + 5}`}
            fill="none"
            stroke={form.primaryGold}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.7}
          />
        ) : bond > 70 ? (
          // Happy smile
          <path
            d={`M ${centerX - 15} ${centerY} Q ${centerX} ${centerY + 10} ${centerX + 15} ${centerY}`}
            fill="none"
            stroke={form.primaryGold}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.7}
          />
        ) : (
          // Neutral line
          <line
            x1={centerX - 15}
            y1={centerY + 5}
            x2={centerX + 15}
            y2={centerY + 5}
            stroke={form.primaryGold}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.7}
          />
        )}
      </g>
    </g>
  );
}
