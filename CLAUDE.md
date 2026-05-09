# City Blocks

## Project Goal
Create a high-quality modern browser remake inspired by the classic Nokia game City Bloxx.

The project should prioritize:
- authentic arcade feel
- retro Nokia-era visual style
- satisfying physics-based gameplay
- polished animations
- responsive controls
- procedural tower instability
- mobile-friendly gameplay
- high replayability

---

# Current Direction

The project is transitioning away from primitive Phaser vector rectangles into a proper sprite-based rendering pipeline.

Existing assets:
- building sprites
- crane sprites
- window sprite sheets
- retro UI frame
- skyline background
- retro effect sprites
- logo assets

---

# Technical Stack

- Phaser 3
- Vite
- JavaScript
- SVG sprite assets
- Web Audio API
- Vercel deployment

---

# Gameplay Design

Core mechanics:
- swinging crane system
- hanging block physics
- release momentum
- tower balance simulation
- cumulative instability
- combo/perfect placement system
- dynamic difficulty scaling
- game-over collapse sequence

Physics inspiration:
- pendulum motion
- center-of-mass balancing
- tower drift
- rotational instability
- damping systems

---

# Visual Direction

The game should resemble:
- Nokia-era arcade games
- late 2000s mobile games
- stylized construction themes
- warm construction color palettes
- pixel-art-inspired rendering

Visual priorities:
- dimensional buildings
- industrial crane details
- animated windows
- atmospheric skyline
- retro UI styling
- satisfying landing effects
- smooth camera movement
- dynamic nighttime transition

Avoid:
- flat placeholder rectangles
- generic gradients
- sterile modern UI
- overly realistic graphics

---

# Audio Direction

Use retro arcade-inspired sound design:
- electronic placement sounds
- combo sounds
- collapse sounds
- crane movement effects
- satisfying perfect-drop feedback

Avoid generic mobile-game audio.

---

# Next Major Tasks

## Rendering Rewrite
- replace procedural block rendering with sprite rendering
- preload all SVG assets properly
- implement layered sprite composition
- improve depth/parallax

## Crane System
- animated trolley movement
- hanging cable physics
- swinging hook animation
- release animation

## Effects
- impact particles
- dust effects
- combo flashes
- destruction fragments
- screen shake polish

## Gameplay Polish
- smoother balancing
- improved difficulty curve
- better collision alignment
- combo reward system
- perfect placement bonuses

## UI Polish
- retro bitmap-style fonts
- animated score transitions
- combo banners
- pause/restart overlays

---

# Design Philosophy

The goal is not simply:
"a stacking blocks game"

The goal is:
"a polished modern recreation of the emotional feel of City Bloxx."

Every system should reinforce:
- tension
- precision
- instability
- satisfaction
- arcade replayability
