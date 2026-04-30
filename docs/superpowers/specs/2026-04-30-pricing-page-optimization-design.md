# Pricing Page Optimization Design Spec

## Objective
Elevate the visual experience of the pricing page (`PCPricingPage.jsx`) to a professional, "art-level" standard by implementing advanced CSS techniques, 3D interactions, and generative motion graphics inspired by `pricing_flip_demo.html`.

## Key Features

### 1. Advanced Card Interaction (Tactile Tilt & Flip)
- **Hierarchy Separation**: Tilt is applied to the outer wrapper (`card-container`), while Flip is applied to the inner container (`card-inner`). This allows 3D tilt to persist even when the card is flipped.
- **Physical Feel**: Use `transition: transform 0.1s ease-out` for the tilt to simulate physical weight.
- **Dynamic Glint**: A radial-gradient light effect that follows the mouse across both the front and back faces of the card.

### 2. Generative Tier Icons
- **Basic (Core)**: A single pulsing particle with glow effects.
- **Advanced (Orbit)**: Three particles rotating in 3D space around a core, with subtle energy connecting lines.
- **Master (Lattice)**: A complex 3D wireframe lattice composed of three squares rotating on different axes.

### 3. Premium Materials
- **Noise Background**: Apply a subtle SVG noise filter to the page and card backgrounds to reduce the "flat digital" look.
- **Ultra-thin Glass**: Backdrop blur (20px) with low-opacity white (rgba 0.04) for a premium frosted glass effect.
- **Typography**: Import and use 'Outfit' font with high contrast weights (800/900) and negative letter spacing.

### 4. Liquid Border (Master Tier Only)
- **Conic Gradient Animation**: Use CSS `@property` to animate a rotating light beam around the card's perimeter.
- **Energy Frame**: The border remains stationary relative to the flipping content, creating a "contained energy" look.

## Implementation Details

### CSS Custom Properties
```css
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

### SVG Noise Filter
```css
.noise-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
}
```

### Components to Create/Update
- `PricingCard`: Main card component with tilt/flip logic.
- `PulseIcon`, `OrbitIcon`, `LatticeIcon`: Individual generative icon components.

## Verification Criteria
- [ ] 3D Tilt works on both front and back faces.
- [ ] Liquid border rotates smoothly around the Master card.
- [ ] Lattice icon spins in 3D space correctly.
- [ ] Noise texture is visible but subtle.
- [ ] Typography matches the "Outfit" font design.
