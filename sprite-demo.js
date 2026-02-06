/**
 * Sprite Demo - Vanilla JS Animation Loop
 * This file demonstrates the sprite-core library in a standalone HTML environment
 */

// Note: In production, these would be imported from the compiled sprite-core library
// For now, this is a self-contained demo with inline implementations

class SimpleSpriteAnimator {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Container not found: ${containerSelector}`);
    }

    this.spriteWrapper = null;
    this.glowElement = null;
    this.initializeDOM();
  }

  initializeDOM() {
    // Clear container
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.display = 'flex';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
    this.container.style.minHeight = '400px';

    // Create glow background
    this.glowElement = document.createElement('div');
    this.glowElement.style.position = 'absolute';
    this.glowElement.style.inset = '0';
    this.glowElement.style.borderRadius = '9999px';
    this.glowElement.style.filter = 'blur(48px)';
    this.glowElement.style.transition = 'all 0.3s ease';
    this.container.appendChild(this.glowElement);

    // Create sprite wrapper
    this.spriteWrapper = document.createElement('div');
    this.spriteWrapper.style.position = 'relative';
    this.spriteWrapper.style.width = '100%';
    this.spriteWrapper.style.maxWidth = '300px';
    this.spriteWrapper.style.height = '300px';
    this.spriteWrapper.style.zIndex = '10';
    this.container.appendChild(this.spriteWrapper);
  }

  getMoodState(vitals) {
    return {
      isHappy: vitals.mood > 70,
      isTired: vitals.energy < 30,
      isUnhappy: vitals.mood < 40,
      isHungry: vitals.hunger > 70,
    };
  }

  getGlowColor(mood) {
    if (mood > 70) return '#3b82f6'; // Happy - blue
    if (mood < 40) return '#ef4444'; // Unhappy - red
    return '#8b5cf6'; // Neutral - purple
  }

  getPupilPosition(mood) {
    if (mood > 70) {
      return { left: { cx: 87, cy: 88 }, right: { cx: 117, cy: 88 } };
    } else if (mood < 40) {
      return { left: { cx: 83, cy: 92 }, right: { cx: 113, cy: 92 } };
    } else {
      return { left: { cx: 85, cy: 90 }, right: { cx: 115, cy: 90 } };
    }
  }

  getMouthPath(mood) {
    if (mood > 70) {
      return 'M 90 110 Q 100 120 110 110'; // Smile
    } else if (mood < 40) {
      return 'M 90 115 Q 100 110 110 115'; // Frown
    } else {
      return 'M 90 112 L 110 112'; // Neutral
    }
  }

  renderSprite(traits, vitals) {
    const moodState = this.getMoodState(vitals);
    const pupilPos = this.getPupilPosition(vitals.mood);
    const mouthPath = this.getMouthPath(vitals.mood);
    const glowColor = this.getGlowColor(vitals.mood);

    const svgContent = `
      <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" id="pet-sprite">
        <defs>
          <radialGradient id="petGloss" cx="35%" cy="35%">
            <stop offset="0%" stop-color="white" stop-opacity="0.4" />
            <stop offset="50%" stop-color="white" stop-opacity="0.1" />
            <stop offset="100%" stop-color="white" stop-opacity="0" />
          </radialGradient>
          <filter id="moodGlow">
            <feGaussianBlur stdDeviation="${moodState.isHappy ? '3' : '1'}" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3" />
          </filter>
        </defs>

        <ellipse cx="100" cy="180" rx="60" ry="12" fill="black" opacity="0.2" filter="url(#shadow)" />

        <g filter="url(#moodGlow)">
          <circle cx="100" cy="100" r="${traits.size * 80}" fill="${traits.primaryColor}" stroke="${traits.secondaryColor}" stroke-width="3" />
        </g>

        <circle cx="100" cy="100" r="${traits.size * 80}" fill="url(#petGloss)" />

        <g opacity="${moodState.isTired ? '0.5' : '1'}" class="eyes">
          <circle cx="85" cy="90" r="8" fill="white" />
          <circle cx="115" cy="90" r="8" fill="white" />
          <circle cx="${pupilPos.left.cx}" cy="${pupilPos.left.cy}" r="5" fill="black" class="left-pupil" />
          <circle cx="${pupilPos.right.cx}" cy="${pupilPos.right.cy}" r="5" fill="black" class="right-pupil" />
        </g>

        <path
          d="${mouthPath}"
          stroke="${traits.secondaryColor}"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          class="mouth"
        />

        ${moodState.isHappy ? `
          <circle cx="100" cy="50" r="2" fill="${traits.primaryColor}" opacity="0.6" class="happy-particle-1" />
          <circle cx="100" cy="50" r="2" fill="${traits.primaryColor}" opacity="0.6" class="happy-particle-2" />
          <circle cx="100" cy="50" r="2" fill="${traits.primaryColor}" opacity="0.6" class="happy-particle-3" />
        ` : ''}

        ${moodState.isTired ? `
          <text x="130" y="60" font-size="12" fill="${traits.primaryColor}" opacity="0.7" class="tired-particle-1">Z</text>
          <text x="130" y="60" font-size="12" fill="${traits.primaryColor}" opacity="0.7" class="tired-particle-2">Z</text>
        ` : ''}
      </svg>
    `;

    this.spriteWrapper.innerHTML = svgContent;

    // Update glow
    this.glowElement.style.background = glowColor;
    this.glowElement.style.opacity = `${Math.max(0.2, vitals.mood / 100) * 0.3}`;

    // Apply animations
    this.applyAnimations(vitals, moodState);
  }

  applyAnimations(vitals, moodState) {
    const svg = this.spriteWrapper.querySelector('#pet-sprite');
    if (!svg) return;

    // Sprite bounce animation
    const duration = moodState.isHappy ? 1500 : moodState.isTired ? 2500 : 2000;
    const yOffset = moodState.isHappy ? 8 : moodState.isHungry ? 10 : 3;

    if (svg.getAnimations().length === 0) {
      svg.animate(
        [
          { transform: 'translateY(0px) rotate(0deg)' },
          { transform: `translateY(-${yOffset}px) rotate(2deg)` },
          { transform: 'translateY(0px) rotate(0deg)' },
        ],
        {
          duration: duration,
          iterations: Infinity,
          easing: 'ease-in-out',
        }
      );
    }

    // Glow pulse
    if (this.glowElement.getAnimations().length === 0) {
      const intensity = Math.max(0.2, vitals.mood / 100);
      this.glowElement.animate(
        [
          { transform: 'scale(1)', opacity: `${intensity * 0.2}` },
          { transform: 'scale(1.2)', opacity: `${intensity * 0.4}` },
          { transform: 'scale(1)', opacity: `${intensity * 0.2}` },
        ],
        {
          duration: 3000,
          iterations: Infinity,
          easing: 'ease-in-out',
        }
      );
    }

    // Particle animations
    if (moodState.isHappy) {
      for (let i = 1; i <= 3; i++) {
        const particle = this.spriteWrapper.querySelector(`.happy-particle-${i}`);
        if (particle) {
          particle.animate(
            [
              { transform: 'translateY(0px)', opacity: 0.6 },
              { transform: 'translateY(-30px)', opacity: 0.3 },
              { transform: 'translateY(-60px)', opacity: 0 },
            ],
            {
              duration: 2000,
              delay: (i - 1) * 300,
              iterations: Infinity,
            }
          );
        }
      }
    }

    if (moodState.isTired) {
      for (let i = 1; i <= 2; i++) {
        const particle = this.spriteWrapper.querySelector(`.tired-particle-${i}`);
        if (particle) {
          particle.animate(
            [
              { transform: 'translateY(0px)', opacity: 0.7 },
              { transform: 'translateY(-20px)', opacity: 0.3 },
              { transform: 'translateY(-40px)', opacity: 0 },
            ],
            {
              duration: 2000,
              delay: (i - 1) * 400,
              iterations: Infinity,
            }
          );
        }
      }
    }
  }
}

// Initialize demo
document.addEventListener('DOMContentLoaded', () => {
  const animator = new SimpleSpriteAnimator('#sprite-container');

  // Mock traits
  const traits = {
    size: 0.8,
    primaryColor: '#a78bfa',
    secondaryColor: '#06b6d4',
    bodyType: 'Spherical',
  };

  // Mock vitals (will cycle through moods)
  const vitals = {
    mood: 50,
    energy: 60,
    hunger: 40,
    hygiene: 75,
    health: 90,
  };

  // Animation loop
  let startTime = Date.now();
  function animationLoop() {
    const elapsed = Date.now() - startTime;
    const time = elapsed / 1000;

    // Cycle vitals for demonstration
    vitals.mood = 50 + 40 * Math.sin(time / 3);
    vitals.energy = 50 + 40 * Math.cos(time / 4);
    vitals.hunger = 50 + 30 * Math.sin(time / 5);

    // Update sprite
    animator.renderSprite(traits, vitals);

    requestAnimationFrame(animationLoop);
  }

  // Start animation loop
  animationLoop();
});
