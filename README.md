# The Wheel - Restaurant Picker

A family restaurant nomination and selection system with admin-controlled wheel spinning, rating system, and email whitelist authentication.

## Features

- **User Nominations**: Family members can nominate restaurants
- **Admin Approval**: Admins approve nominations before they appear on the wheel
- **Spinning Wheel**: Visual wheel animation to randomly select a restaurant
- **State Management**: Restaurants progress through states (pending → active → upcoming → visited)
- **Rating System**: After visiting, admins can mark attendance and collect ratings
- **Email Whitelist**: Only whitelisted emails can sign up
- **Mobile-First**: Responsive design optimized for mobile devices
- **VATSIM-Inspired UI**: Clean, professional design aesthetic

## Tech Stack

### Backend
- **Cloudflare Workers**: Serverless backend
- **Cloudflare D1**: SQLite database
- **Hono**: Lightweight web framework
- **TypeScript**: Type-safe development

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Data fetching and caching
- **React Router**: Client-side routing

## Project Structure

```
restaurant-wheel/
├── backend/          # Cloudflare Workers API
├── frontend/         # React application
└── shared/           # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd Restaurant-Wheel
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Development

#### Backend

1. **Create D1 database** (first time only)
```bash
cd backend
wrangler d1 create restaurant-wheel-db
```

Copy the database ID into `wrangler.toml` under `database_id`.

2. **Run migrations**
```bash
npm run migrate:local
```

3. **Start development server**
```bash
npm run dev
```

Backend will be available at `http://localhost:8787`

#### Frontend

1. **Start development server**
```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Deployment

#### Backend (Cloudflare Workers)

1. **Create production D1 database**
```bash
wrangler d1 create restaurant-wheel-db
```

2. **Run production migrations**
```bash
npm run migrate:prod
```

3. **Deploy**
```bash
npm run deploy
```

#### Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
wrangler pages deploy dist
```

## Configuration

### Admin Emails

Edit `backend/src/config.ts` to set admin email addresses.

### Email Whitelist

Admins can manage the whitelist through the admin panel, or you can add emails directly to the database.

## Restaurant States

1. **pending** - User submits nomination, awaiting admin approval
2. **active** - Admin approved, appears on the spinning wheel
3. **upcoming** - Wheel selected it, family plans to visit soon
4. **visited** - Admin confirmed the visit, enables rating system

## License

MIT
