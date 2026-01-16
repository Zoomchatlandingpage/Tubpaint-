# Design Guidelines: Cognitive Agent System Dashboard

## Design Approach
**System-Based + Custom UI Enhancement**  
Foundation: Professional dashboard patterns (Linear, Vercel Dashboard, Notion) with custom cognitive system visualization needs. Your existing prototypes establish excellent dark-theme foundations - we're formalizing and extending this system-wide.

## Core Design Principles
1. **Information Clarity Over Decoration**: Every visual element serves data comprehension
2. **Status-First Design**: System state must be instantly readable
3. **Hierarchical Depth**: Multiple information layers without overwhelming
4. **Trust Through Precision**: Professional aesthetic builds confidence in AI decisions

---

## Typography System

### Font Stack
- **Primary**: `font-mono` (system monospace) - reinforces technical precision
- **Secondary**: `font-sans` (system sans) - for longer descriptive text
- **Accent**: Maintain monospace for metrics, IDs, timestamps

### Hierarchy
- **Page Titles**: `text-2xl font-bold tracking-tight` 
- **Section Headers**: `text-sm font-semibold uppercase tracking-widest text-zinc-500`
- **Card Titles**: `text-lg font-semibold`
- **Body Text**: `text-sm text-zinc-400`
- **Metadata**: `text-xs text-zinc-500`
- **Metrics**: `text-2xl font-bold` (with color coding)

---

## Color System

### Base Palette
- **Background**: `bg-zinc-950` (primary) / `bg-zinc-900` (elevated surfaces)
- **Cards**: `bg-zinc-900/50` with `border-zinc-800/50` 
- **Text Primary**: `text-zinc-100`
- **Text Secondary**: `text-zinc-400`
- **Text Tertiary**: `text-zinc-500`

### Semantic Colors
- **Active/Success**: `emerald-500/400` (agents running, validated concepts)
- **In-Progress**: `amber-500/400` (phases executing, processing)
- **Waiting/Idle**: `zinc-500/600` (queued states)
- **Error/Rejected**: `red-500/400` (failed validation)
- **Brand/Accent**: Gradient `from-violet-600 to-fuchsia-600`

### Gradient Usage
- **Primary CTA buttons**: `bg-gradient-to-r from-violet-600 to-fuchsia-600`
- **Active project highlights**: `from-violet-600/20 to-fuchsia-600/20` (backgrounds)
- **Brand elements**: Logo, headers, key metrics

---

## Layout & Spacing

### Spacing Primitives
Use Tailwind units: **2, 3, 4, 6, 8** for consistency
- Tight spacing: `gap-2`, `p-2`, `space-y-2`
- Standard spacing: `gap-4`, `p-4`, `space-y-3`
- Generous spacing: `gap-6`, `p-6`, `space-y-6`
- Section breaks: `gap-8`, `py-8`

### Grid Structure
- **Sidebar**: Fixed `w-72` (projects, memory stats)
- **Main Content**: `flex-1` (phases, agents, execution)
- **Cards Grid**: `grid grid-cols-2 gap-6` (agents, learnings, metrics)
- **Metrics Grid**: `grid grid-cols-2 gap-3` (compact stat displays)

### Container Strategy
- **Full-width sections**: No max-width, fill available space
- **Card content**: `p-4` to `p-6` based on density
- **Nested content**: `p-3` for sub-cards

---

## Component Patterns

### Status Indicators
**Visual System**:
- **Dot indicators**: `w-2 h-2 rounded-full` with status colors
- **Animated pulse**: `animate-pulse` for active states only
- **Icon badges**: `w-10 h-10 rounded-lg` containing Lucide icons
- **Status text**: Small pill badges `px-2 py-0.5 rounded-full text-xs`

### Cards
**Standard Card**:
```
bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50
```

**Elevated Card** (in-progress, selected):
```
bg-zinc-900 border-amber-700/50 shadow-lg shadow-amber-900/20
```

**Glassmorphic Effect** (optional accents):
```
backdrop-blur-sm bg-zinc-900/50
```

### Progress Bars
- **Height**: `h-1.5` (minimal) or `h-2` (standard)
- **Container**: `bg-zinc-800 rounded-full overflow-hidden`
- **Fill**: Gradient matching status (`from-violet-500 to-fuchsia-500` or single color)
- **Always show percentage**: `text-xs` adjacent to bar

### Buttons
**Primary Action**:
```
bg-gradient-to-r from-violet-600 to-fuchsia-600 
px-6 py-3 rounded-xl font-semibold
shadow-lg shadow-violet-600/30
hover:from-violet-500 hover:to-fuchsia-500
```

**Secondary/Icon Buttons**:
```
p-2 hover:bg-zinc-800 rounded-lg transition-colors
```

### Phase Timeline
- **Horizontal flow**: Connected phases with arrows/chevrons
- **Status icons**: Left-aligned in rounded containers
- **Expandable details**: Click to reveal phase-specific data
- **Locked states**: Reduced opacity, lock icon, no interaction

---

## Information Architecture

### Dashboard Layout
1. **Header Bar**: Brand, system status (AG-0 online), settings
2. **Sidebar** (fixed left): Project list, memory statistics, quick actions
3. **Main Content**: 
   - Project header with execute/pause controls
   - Phase timeline (primary focus)
   - Dual-panel bottom: Agents status + Recent learnings

### Data Density Levels
- **Overview**: High-level metrics, phase progress
- **Detail**: Expandable cards show docs count, concepts, timestamps
- **Deep Dive**: Click-through to full agent logs, validation details

---

## Interaction States

### Hover States
- Cards: `hover:border-zinc-700/50` (subtle border brighten)
- Buttons: Background shade change (defined per button type)
- Metrics: No hover (static data)

### Active States
- Selected project: Border + gradient background `border-violet-500/30`
- Executing phase: Pulsing animation, amber border
- Agent status: Dot color + pulse if active

### Disabled States
- Locked phases: `opacity-50 cursor-not-allowed`
- Unavailable actions: Grayed out with clear visual distinction

---

## Iconography
**Library**: Lucide React exclusively
- **Brain**: System logo, AI/learning indicators
- **Play/Pause**: Execution controls
- **Eye**: View details
- **Database**: Data/memory access
- **CheckCircle**: Completed states
- **Clock**: Pending/waiting
- **Lock**: Locked/unavailable
- **Activity**: In-progress (with pulse)
- **Zap**: Active agents
- **Settings**: Configuration

---

## Special Visualizations

### Agent Status Grid
- 2-column grid for compact display
- Each cell: Status dot + Agent ID + Name
- Color-coded by state (emerald/amber/zinc)
- Monospace font for "AG-X" identifiers

### Learning Validation Display
- List items with validation badge (✓ or ✗)
- Green background tint for validated
- Red background tint for rejected
- Source attribution in tertiary text

### Memory Statistics
- Large metric numbers (2xl font)
- Color-coded (emerald for validated, red for rejected)
- Compact 2-column grid in sidebar

---

## Animation Guidelines
**Minimal & Purposeful Only**:
- Status dot pulse for active states
- Progress bar fills (smooth `transition-all duration-500`)
- Hover transitions (`transition-colors`)
- **Avoid**: Slide-ins, fades, complex animations

---

## Accessibility
- Maintain 4.5:1 contrast ratios (zinc palette ensures this)
- Clear focus states on interactive elements
- Semantic HTML for agent/phase structures
- Screen reader text for status indicators

---

This system prioritizes **data clarity, professional trust, and rapid information parsing** - essential for monitoring complex AI agent workflows where decisions have real consequences.