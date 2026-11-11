# KERN // Software Project Operating System

A high-precision software management dashboard blending Notion-grade structure with GitHub-style project tracking, crafted in a sharp Swiss-futuristic aesthetic with zero animations, zero pills, and big open negative space.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX specifications incorporate your confirmed choices from Phase 1 alongside strict visual guidelines:

- **Confirmed: Project Details Presentation**: Dedicated **expandable card panel** located directly below each project card, exposing live site URL, host company, and sensitive administrative credentials (with reveal/hide and one-click copy affordances).
- **Confirmed: Authentication Experience**: Minimalist **username and password authentication** (Sign In / Register) that never requests an email address. Includes persistent session state across page reloads.
- **Confirmed: Visual Theme**: **User-toggleable Dark and Light modes** adhering to Swiss modernist principles: crisp hairline grids, generous open whitespace, tight micro-typography, tabular data alignment, and no decorative animations or title icons.
- **Rainbow Sprint Progress Gauge**: Custom SVG 7-color spectral progress indicator (Red, Orange, Yellow, Green, Cyan/Blue, Indigo, Violet) where each bow illuminates as sprint tasks progress from 0% to 100%.
- **Zero-Pill Compliance**: All metadata (tags, statuses, dates, version badges) rendered strictly as unboxed, sharp text using typographic separators (`·` and `/`), free of static capsule pills or rounded badges.

---

## 1. Overview & Core Concept

**KERN** is a software engineering control center designed for solo developers and technical founders. It merges project registry telemetry (business vertical, start date, semver version, active users) with current sprint task tracking.

- **Primary Persona**: Software engineers and technical project leads managing multiple products who require instant clarity over sprint deliverables, live deployments, and credentials without bloated project management clutter.
- **Key Value**: A consolidated single-screen operational console that provides high-density project metadata, instant sprint velocity visualization via illuminated rainbow arcs, filtered task lists, and exportable audit reports (PDF & modal).

---

## 2. User Experience & Visual Design

### A. Information Architecture & Key Flows
1. **Authentication Gate**: Simple username and password sign-in and account registration. Does not collect email. Allows guest preview or instant account creation.
2. **Global Header (Top Bar Contract)**:
   - *Left*: Brand wordmark (`KERN // OS`).
   - *Center*: Primary navigation anchors (`Projects`, `Current Sprints`, `Audit Log`, `Documentation`).
   - *Right*: Light/Dark theme toggle and active user session profile menu.
3. **Section 1 — Project Registry & System Overview**:
   - High-density table / structured grid displaying all projects with Business Type, Start Date, Version Number, and Active User Count.
   - Action bar with **View Log Modal** and **Download PDF Report** triggers.
   - Quick "Add Project" drawer/modal with instant validation.
4. **Section 2 — Current Sprint & Task Tracker**:
   - Search & Filter bar: real-time live filtering by task tags (`frontend`, `api`, `auth`, `infra`) and status (`Backlog`, `In Progress`, `Review`, `Done`).
   - Project Sprint Cards:
     - Header: Project Name, Current Version (`v2.4.1`), and isolated Last Touched timestamp (`TOUCHED 24M AGO`).
     - Sprint completion gauge: Compact 7-arc rainbow indicator reflecting completion percentage ($n/7$ illuminated spectral bands).
     - Expandable Project Details Panel: toggle button opening a crisp panel showing Live Site URL, Hosted Platform (e.g. AWS, Cloudflare, Vercel), Admin Username, and Admin Password with masked/unmasked toggle and copy button.
     - Task Checklist: clean list of next sprint tasks with status selector, assignee, tags, and inline task creator.

```
┌────────────────────────────────────────────────────────────────────────┐
│ KERN // OS              Projects   Current Sprints   Audit Log  [☼] [User] │
├────────────────────────────────────────────────────────────────────────┤
│ 01. PROJECT REGISTRY                    [ View Audit Modal ] [ Export PDF ]│
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ PROJECT      VERTICAL     START DATE   SEMVER    USERS   ACTIONS   │ │
│ │ Hyperion     Fintech B2B  2026-01-15   v3.2.0    48,200  [Inspect] │ │
│ │ VectorDB     DevTools     2025-08-10   v1.8.4     8,950  [Inspect] │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ 02. ACTIVE SPRINT DELIVERABLES          [ Search tags or status...   ] │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ HYPERION CORE  v3.2.0                           LAST TOUCHED 14M AGO│ │
│ │ Progress: [ 🌈 5/7 arcs lit · 71% ]                [▾ Project Details]│ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ ▼ PROJECT CREDENTIALS & DEPLOYMENT (EXPANDED)                      │ │
│ │   Live: https://hyperion.io · Host: AWS us-east-1                  │ │
│ │   Admin: root@hyperion · Pass: •••••••••••• [Show] [Copy]          │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ TASKS:                                                             │ │
│ │ [✓] Implement passkey biometric webauthn · Auth · Done             │ │
│ │ [ ] Refactor streaming chunk parser · Backend · In Progress        │ │
│ │ [ ] + Add new task for this sprint...                              │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### B. Visual Identity & Swiss Typographic Language
- **Aesthetic**: Modernist Swiss International Typographic style with big open spaces, strict hairline grids, ultra-sharp typography, and stark negative space.
- **Typography**:
  - Primary UI & Display: `Plus Jakarta Sans` (weights 400, 600, 700) for razor-sharp geometric precision.
  - Data, Dates, Versions, Numerals: `JetBrains Mono` with `tabular-nums` for rock-solid vertical decimal alignment.
  - Headline containment: `text-wrap: balance` to eliminate typographic orphans.
- **Color Discipline (60-30-10)**:
  - *Light Mode*: Canvas `#FBFBFC` (60%), Structural surfaces `#FFFFFF` with `#E5E7EB` borders (30%), Sharp carbon black `#111827` text and accents (10%).
  - *Dark Mode*: Canvas `#0B0C0E` (60%), Structural surfaces `#131518` with `#23272F` borders (30%), Crisp chalk white `#F3F4F6` text and accents (10%).
  - *Zero Pill Rule*: No rounded bubble badges or colored capsules. Metadata uses unboxed monospace text separated by subtle bullets or slashes (`v2.4.0 · Fintech · 12,400 Users`).
  - *Zero Animation Rule*: No layout shifts, no bouncy spring physics, no pulse animations; instant, crisp, deterministic rendering.
  - *Title Rule*: No emoji or icons prefixing section titles or headings.

### C. The 7-Arc Rainbow Progress Indicator
The sprint progress bar is rendered as an exquisite, compact mathematical SVG icon featuring 7 concentric arcs corresponding to traditional spectral divisions:
1. Arc 1 ($0\%-14\%$): Red (`#EF4444`)
2. Arc 2 ($15\%-28\%$): Orange (`#F97316`)
3. Arc 3 ($29\%-42\%$): Yellow (`#EAB308`)
4. Arc 4 ($43\%-57\%$): Green (`#10B981`)
5. Arc 5 ($58\%-71\%$): Cyan / Sky Blue (`#0EA5E9`)
6. Arc 6 ($72\%-85\%$): Indigo (`#6366F1`)
7. Arc 7 ($86\%-100\%$): Violet (`#8B5CF6`)

Unlit arcs remain visible in muted hairline gray (`#E5E7EB` in light mode, `#27272A` in dark mode). When tasks are completed, the corresponding arcs illuminate with vivid spectral saturation.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Expandable Cards for Project Credentials**
  - *Chosen*: Integrated collapsible card panel right underneath each project card, toggled via a clean text control (`Details / Credentials`).
  - *Why*: Keeps context immediately adjacent to the project's current sprint tasks without navigating away or occluding the screen with nested popovers.
  - *Alternatives considered*: Modal dialogs (interrupts flow) or slide-out drawer (disconnected on wide screens).
- **Decision 2: Client-side Persistent Auth & Data Store**
  - *Chosen*: LocalStorage-backed authentication and project state engine with preloaded seed projects and sprints.
  - *Why*: Provides instant sub-millisecond responsiveness, complete offline capability, zero external network failure points, and immediate usability upon first visit.
- **Decision 3: Built-in PDF Engine**
  - *Chosen*: Clean, print-optimized document generator with formatted table layout, summary metrics, and timestamped audit logs.
  - *Why*: Allows instant offline sharing and compliance archival without heavy external server dependencies.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Root (App.tsx)                             │
│       │                                                        │       │
│       ▼                                                        ▼       │
│  [ Auth Context ]                                       [ Theme State ]│
│  (User / Pass Session)                                  (Dark / Light) │
│       │                                                        │       │
│       ├─────────────────────────┬──────────────────────────────┘       │
│       ▼                         ▼                                      │
│ [ Top Navigation Bar ]   [ Main Dashboard View ]                       │
│       │                         │                                      │
│       ├─────────────────────────┼──────────────────────────────┐       │
│       ▼                         ▼                              ▼       │
│ [Project Registry]      [Current Sprint Hub]          [Modals & PDF]   │
│ - Project List Table    - Filter & Search             - Audit Log View │
│ - Version & Metric KPIs - Rainbow Progress (7 Arcs)   - PDF Generator  │
│ - New Project Trigger   - Expandable Credentials Card - New Task Modal │
│                         - Sprint Task Checklist                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model
- **User**: `id`, `username`, `createdAt`
- **Project**:
  - `id`: unique identifier
  - `name`: string (e.g., "Hyperion Engine")
  - `businessType`: string (e.g., "SaaS / Fintech", "Developer Tooling", "HealthTech")
  - `startDate`: ISO date string
  - `version`: string semver (e.g., "v2.4.1")
  - `activeUsers`: number (e.g., 28400)
  - `lastTouched`: ISO timestamp
  - `details`:
    - `liveSite`: string URL
    - `hostedCompany`: string (e.g., "AWS Lambda + Cloudflare Edge")
    - `adminName`: string
    - `adminPassword`: string (optional, encrypted or plain toggle)
- **Task**:
  - `id`: string
  - `projectId`: string
  - `sprintName`: string (e.g., "Sprint 34: Quantum Bridge")
  - `title`: string
  - `status`: `"backlog" | "in_progress" | "review" | "done"`
  - `tags`: string[] (e.g., `["auth", "security", "high-prio"]`)
  - `createdAt`: ISO timestamp
  - `updatedAt`: ISO timestamp

---

## Next Steps Upon User Approval
1. Configure Tailwind CSS v4 custom dark mode variant in `src/index.css`.
2. Implement auth and persistent state manager with rich sample software projects.
3. Construct the Swiss typographic dashboard, 7-color rainbow progress indicator, expandable project details cards, search filter, and PDF/modal export engine.
4. Verify complete build and zero-lint execution.
