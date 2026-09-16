# FitTrack 🏋️‍♂️✨

**FitTrack** is a tactile workout logging and routine management web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Drizzle ORM** with **PostgreSQL**.

Designed with a custom **Dark Neumorphic & Glassmorphic UI**, FitTrack provides a modern, responsive, and intuitive interface for planning weekly workout routines, tracking sets and weights, and managing an exercise database.

---

## 🚀 Features

- 📅 **Weekly Schedule Planner**: Easily assign, switch, or inspect workout routines across Monday–Sunday. Features automatic `isToday` tracking and `useSyncExternalStore` for persistent local storage synchronization.
- 🏋️ **Exercise Library**: Searchable database of exercises categorized by target muscle groups (Chest, Back, Shoulders, Legs, Hamstrings, Arms, Abs) with category filtering and real-time management.
- 📊 **Program Routines**: Browse structured workout routines (Upper Body A/B, Lower Body A/B, Full Body Conditioning, Rest & Mobility) with exercise set targets.
- ✏️ **Tactile Set & Weight Logging**: Log sets, weights (kg), reps, and check off completed sets with interactive tactile feedback.
- 🎨 **Dark Neumorphic Glassmorphism UI**: Beautiful OKLab color palette with glassmorphism blur panels, depth inset/outset shadows, and smooth touch-first UI interactions.
- 🛡️ **Robust Error & Loading Boundaries**: Features custom Next.js App Router loading skeletons (`loading.tsx`), 404 page (`not-found.tsx`), and client error boundary (`error.tsx`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism & Neumorphism Design Tokens
- **Database**: PostgreSQL / [Neon Database](https://neon.tech/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Iconography & Fonts**: Google Material Symbols Outlined, Plus Jakarta Sans, Space Grotesk

---

## 📂 Project Structure

```text
FitTrack/
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js API Routes (exercises, programs, workoutSets)
│   │   ├── exercises/           # Exercise Library Page
│   │   ├── program/             # Active Program Page
│   │   ├── programs/            # Program Library & Detail ([id]) Pages
│   │   ├── error.tsx            # Global Error Boundary Page
│   │   ├── globals.css          # Tailwind CSS v4 & Neumorphic Theme Tokens
│   │   ├── layout.tsx           # Root Layout & Font Setup
│   │   ├── loading.tsx          # Loading Skeleton Page
│   │   ├── not-found.tsx        # Custom 404 Page
│   │   └── page.tsx             # Weekly Schedule Home Page
│   ├── components/
│   │   ├── BottomNav.tsx        # Mobile-First Navigation Bar
│   │   ├── Header.tsx           # App Header Bar
│   │   ├── ProgramPickerModal.tsx # Routine Selection Modal
│   │   └── Toast.tsx            # Notification Toast Component
│   └── db/
│       ├── index.ts             # Drizzle Database Connection
│       ├── schema.ts            # Database Tables & Relations
│       └── seed.ts              # Database Seeder Script
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **pnpm** / **yarn**
- **PostgreSQL** database (e.g. Neon, Supabase, or local Postgres)

### 1. Clone the Repository

```bash
git clone https://github.com/SDEPR89/FitTrack.git
cd FitTrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fittrack
```

### 4. Seed Database (Optional)

Populate default exercises and program templates into your PostgreSQL database:

```bash
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view FitTrack!

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the Next.js production server |
| `npm run lint` | Runs ESLint to check for code quality and React 19 rules |
| `npm run seed` | Runs the database seeding script via `tsx` |

---

## ⚙️ Quality & Testing

Verify code quality, TypeScript safety, and production build readiness:

```bash
# Type check
npx tsc --noEmit

# Linting
npm run lint

# Production Build Check
npm run build
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
