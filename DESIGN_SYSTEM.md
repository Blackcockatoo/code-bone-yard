# Meta-Pet Design System

A cosmic, mystical design language for digital companions built on the "Temple With Curtains" philosophy.

## 🌌 Design Philosophy

The Meta-Pet design system embodies three core principles:

### 1. **Cosmic Wonder**
Every element evokes the mystery and beauty of the cosmos. Deep space colors, ethereal glows, and particle effects create an otherworldly experience that feels magical yet approachable.

### 2. **Gentle Transparency**
Using glass morphism and subtle gradients, we create depth without heaviness. The interface feels layered and sophisticated while maintaining clarity and readability.

### 3. **Non-Punishing Premium**
Premium features are visible but gracefully gated. Locked elements use elegant indicators (✨🔒) rather than harsh barriers, inviting upgrade without creating frustration.

---

## 🎨 Color Palette

### Cosmic Foundation
```css
--cosmic-void:    #0a0118  /* Deep space background */
--cosmic-deep:    #160933  /* Primary containers */
--cosmic-medium:  #2d1b69  /* Secondary elements */
--cosmic-bright:  #4a2d8f  /* Hover states */
--cosmic-glow:    #6b46c1  /* Active elements */
```

### Accent Colors
```css
--accent-celestial:  #a78bfa  /* Primary actions */
--accent-ethereal:   #c4b5fd  /* Text & borders */
--accent-mystic:     #e9d5ff  /* Subtle highlights */
--accent-quantum:    #06b6d4  /* Quantum/tech features */
--accent-energy:     #10b981  /* Success & growth */
--accent-warning:    #f59e0b  /* Warnings */
--accent-danger:     #ef4444  /* Destructive actions */
```

### Gradients
```css
--gradient-cosmic:    linear-gradient(135deg, #0a0118 → #2d1b69 → #4a2d8f)
--gradient-ethereal:  linear-gradient(135deg, #6b46c1 → #a78bfa → #c4b5fd)
--gradient-quantum:   linear-gradient(135deg, #06b6d4 → #3b82f6 → #8b5cf6)
--gradient-energy:    linear-gradient(135deg, #10b981 → #34d399)
```

---

## 🏗️ Layout System

### Spacing Scale
Based on a harmonious 8px grid system:

```css
--space-xs:   0.25rem  /* 4px  - Tight spacing */
--space-sm:   0.5rem   /* 8px  - Related elements */
--space-md:   1rem     /* 16px - Default spacing */
--space-lg:   1.5rem   /* 24px - Section spacing */
--space-xl:   2rem     /* 32px - Major sections */
--space-2xl:  3rem     /* 48px - Page sections */
--space-3xl:  4rem     /* 64px - Hero sections */
```

### Border Radius
```css
--radius-sm:   0.375rem  /* 6px  - Small elements */
--radius-md:   0.5rem    /* 8px  - Buttons, inputs */
--radius-lg:   0.75rem   /* 12px - Cards */
--radius-xl:   1rem      /* 16px - Major containers */
--radius-2xl:  1.5rem    /* 24px - Hero elements */
--radius-full: 9999px    /* Full - Pills, avatars */
```

---

## ✨ Visual Effects

### Glass Morphism
The signature aesthetic of Meta-Pet interfaces:

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
}
```

**Usage:**
- Primary containers (genome display, consciousness panel)
- Overlay elements (modals, dropdowns)
- Card components

### Glow Effects
```css
--shadow-glow:        0 0 20px rgba(107, 70, 193, 0.5)
--shadow-glow-strong: 0 0 30px rgba(107, 70, 193, 0.8)
```

**Usage:**
- Hover states on interactive elements
- Active features in premium tier
- Particle effects
- Field resonance indicators

### Particle Fields
Dynamic particle systems that respond to emotional states:

- **Serene:** 8 particles, slow drift
- **Playful:** 25 particles, energetic movement
- **Transcendent:** 40 particles, cosmic swirl
- **Withdrawn:** 6 particles, minimal motion

---

## 🎭 Components

### Stat Bars
Animated progress indicators with gradient fills and shimmer effects:

```html
<div class="stat-bar">
  <span>Energy</span>
  <div class="bar">
    <div class="fill" style="width: 75%;"></div>
  </div>
</div>
```

**Features:**
- Smooth width transitions (350ms cubic-bezier)
- Shimmer overlay animation
- Quantum gradient fill
- Glowing shadow

### Ritual Buttons
Interactive ritual menu with hover and lock states:

```html
<button class="available">
  <span class="icon">🎵</span>
  <span class="name">Resonate</span>
</button>

<button class="locked">
  <span class="icon">🔮</span>
  <span class="name">Attune</span>
  <span class="lock">🔒</span>
</button>
```

**States:**
- **Available:** Full color, hover lift, glow on hover
- **Locked:** 50% opacity, lock icon, no-cursor, darkened overlay

### DNA Viewer
Monospace code display with color-coded strands:

```html
<div class="raw-dna">
  <h4>Raw Genome</h4>
  <div class="dna-strand red">Red: 101011001101...</div>
  <div class="dna-strand blue">Blue: 110010110111...</div>
  <div class="dna-strand black">Black: 010110011101...</div>
</div>
```

**Features:**
- Horizontal scroll for long sequences
- Color-coded borders (red, blue, purple)
- Gradient backgrounds
- Monospace typography

### Upgrade Prompts
Non-punishing paywalls with gentle CTAs:

```html
<div class="upgrade-prompt gentle">
  <div class="icon">✨</div>
  <h3>Expand Your Garden</h3>
  <p>Nurture more souls...</p>
  <button class="cta-primary">Explore Premium</button>
  <button class="cta-secondary">Maybe Later</button>
</div>
```

**Features:**
- Fade-in-up animation
- Gentle pulse on icon
- Primary and secondary CTAs
- Celestial border glow
- "Maybe Later" always visible (non-punishing)

---

## 🎬 Animations

### Timing Functions
```css
--transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1)      /* Micro-interactions */
--transition-base:   250ms cubic-bezier(0.4, 0, 0.2, 1)      /* Standard */
--transition-slow:   350ms cubic-bezier(0.4, 0, 0.2, 1)      /* Complex transitions */
--transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)  /* Playful elements */
```

### Keyframe Animations

#### Cosmic Drift (Background)
```css
@keyframes cosmic-drift {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
  50%      { transform: scale(1.1) rotate(5deg); opacity: 0.8; }
}
/* Duration: 20s, infinite loop */
```

#### Gentle Bounce (Emojis)
```css
@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
/* Duration: 2s, infinite loop */
```

#### Pulse Glow (SVG Elements)
```css
@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(107, 70, 193, 0.6)); }
  50%      { filter: drop-shadow(0 0 20px rgba(107, 70, 193, 0.9)); }
}
/* Duration: 3s, infinite loop */
```

#### Shimmer (Stat Bars)
```css
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
/* Duration: 2s, infinite loop */
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile-first approach */
@media (max-width: 768px) {
  /* Typography scales down */
  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }

  /* Single column layouts */
  .basic-traits { grid-template-columns: 1fr; }
  .ritual-menu { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
  .cosmetic-shop .packs { grid-template-columns: 1fr; }
}
```

### Touch Optimization
- Minimum touch target: 44×44px
- Hover effects disabled on touch devices
- Swipe-friendly horizontal scrolling for DNA strands
- Larger tap areas for ritual buttons on mobile

---

## 🎯 Tier-Specific Styling

### Free Tier
```css
.tier-badge.tier-free {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
}
```

**Visual Indicators:**
- Green gradient badges
- Full color, no opacity reduction
- Simple, clean presentation

### Premium Tier
```css
.tier-badge.tier-premium {
  background: linear-gradient(135deg, #6b46c1 0%, #a78bfa 100%);
  color: white;
}
```

**Visual Indicators:**
- Purple gradient badges
- Enhanced glow effects
- Particle field activation
- Expanded stat displays

### Mythic Tier
```css
.tier-badge.tier-mythic {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
}
```

**Visual Indicators:**
- Gold gradient badges
- Strong glow effects
- Raw DNA viewer access
- Mathematical readouts
- Deep memory indicators

---

## 🛠️ Usage Guidelines

### Do's ✅
- Use glass morphism for primary containers
- Apply glow effects to interactive elements on hover
- Use gradient text for headings
- Maintain cosmic color palette consistency
- Include "Maybe Later" option on all paywalls
- Animate state changes smoothly
- Provide visual feedback for all interactions

### Don'ts ❌
- Don't use harsh borders or solid backgrounds
- Don't hide locked features completely
- Don't use punishing language in upgrade prompts
- Don't exceed 40 particles in particle fields (performance)
- Don't use non-cosmic colors without justification
- Don't reduce accessibility for visual effects

---

## 🔧 Implementation

### Basic Setup
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="glass">
      <!-- Your content -->
    </div>
  </div>
</body>
</html>
```

### Component Example
```html
<!-- Genome Display -->
<div class="genome-display glass">
  <div class="basic-traits">
    <div class="physical">
      <h3>Appearance</h3>
      <p>Ethereal Wisp</p>
      <div class="colors">
        <div style="background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%);"></div>
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);"></div>
      </div>
    </div>
  </div>
</div>
```

---

## 📊 Performance Considerations

### Optimization Strategies
1. **Backdrop Filter:** Use sparingly, can impact performance
2. **Particle Count:** Cap at 40 particles maximum
3. **Animations:** Use `transform` and `opacity` for GPU acceleration
4. **Battery Mode:** Reduce particle count and disable animations
5. **Lazy Loading:** Load heavy visual effects on interaction

### Performance Targets
- **Initial Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Animation FPS:** 60fps (or 30fps in battery mode)
- **Particle Field:** 60fps with 40 particles

---

## 🎨 Accessibility

### Color Contrast
All text meets WCAG AA standards:
- **Primary text:** #c4b5fd on #0a0118 (contrast: 10.5:1)
- **Secondary text:** #a78bfa on #160933 (contrast: 8.2:1)
- **Interactive elements:** Minimum 3:1 contrast

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus states use glow effects
- Tab order follows logical flow

### Screen Readers
- Semantic HTML throughout
- ARIA labels for icon-only buttons
- Status announcements for state changes

---

## 🚀 Demo

View the complete design system in action:

```bash
# Open the demo file
open meta-pet-core/demo.html
```

The demo showcases:
- ✅ Genome Display with trait breakdown
- ✅ Consciousness panel with drive meters
- ✅ Ritual menu with locked/unlocked states
- ✅ Particle field animations
- ✅ Upgrade prompts
- ✅ Cosmetic shop with all packs
- ✅ Interactive hover effects
- ✅ Cursor particle trails
- ✅ Responsive layouts

---

## 📝 Credits

**Design Philosophy:** Temple With Curtains
**Color Inspiration:** Cosmic nebulae, deep space imagery
**Typography:** System font stacks for performance
**Effects:** Glass morphism, particle physics, quantum gradients

---

## 📄 License

This design system is part of the Meta-Pet project and follows the same MIT license.

**Built with ✨ cosmic wonder for digital companions**
