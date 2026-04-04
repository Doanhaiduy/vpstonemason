# vpstonemason Web

A premium website for an Australian stone benchtops showroom, featuring a Next.js frontend and NestJS backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **Backend** | NestJS + TypeScript + Mongoose |
| **Database** | MongoDB |
| **Auth** | JWT (access + refresh tokens) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env  # Edit .env with your settings
npm run start:dev      # Runs on http://localhost:4000
```

### 2. Seed Database

```bash
cd backend
npm run seed
# Creates admin user: admin@pvstone.com.au / admin123
# Creates sample categories, stones, projects, and blog posts
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:3000
```

### 4. Docker (Alternative)

```bash
docker compose up -d   # Runs full stack via Nginx on http://localhost
```

### 5. VPS Deployment (Docker + Nginx)

This project now includes a production-ready Docker stack in `docker-compose.yml`:

- `nginx` as reverse proxy on port `80`
- `frontend` (Next.js)
- `backend` (NestJS)
- `mongodb` (MongoDB 7 with reduced cache for low-memory VPS)

For low-resource VPS (2 Core / 2GB RAM), use the optimized stack without local MongoDB:

```bash
docker compose -f docker-compose.vps.yml up -d --build
```

Full end-to-end guide:

- `docs/VPS-DEPLOYMENT-2GB.md`

#### Step 1: Prepare environment

```bash
cp .env.vps.example .env
```

Edit `.env` and set at least:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `FRONTEND_URL`
- `JWT_SECRET`

#### Step 2: Build and start

```bash
docker compose up -d --build
```

#### Step 3: Check status

```bash
docker compose ps
docker compose logs -f nginx
docker compose logs -f backend
```

#### Notes for 2GB VPS

- Keep only port `80` open publicly (plus `443` if you terminate TLS on VPS).
- MongoDB cache is limited to `0.25GB` in compose to reduce RAM usage.
- If you use external MongoDB (Atlas), set `DATABASE_URL` and `MONGODB_URI` accordingly.

## Project Structure

```
stone-showroom-web/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── common/          # Decorators, guards, filters
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # JWT authentication
│   │   │   ├── users/       # User management
│   │   │   ├── stones/      # Stone products
│   │   │   ├── stone-categories/
│   │   │   ├── projects/    # Project portfolio
│   │   │   ├── enquiries/   # Contact/quote forms
│   │   │   ├── blog/        # Blog posts
│   │   │   └── showroom/    # Showroom settings
│   │   ├── seed.ts          # Database seeder
│   │   └── main.ts          # Bootstrap
│   └── .env
├── frontend/                # Next.js Frontend
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   │   ├── page.tsx     # Home
│   │   │   ├── about/       # About Us
│   │   │   ├── stones/      # Stone Catalogue
│   │   │   ├── projects/    # Projects Gallery
│   │   │   ├── showroom/    # Showroom Info
│   │   │   ├── blog/        # Blog
│   │   │   ├── contact/     # Contact Form
│   │   │   └── admin/       # Admin Panel
│   │   ├── components/      # React Components
│   │   ├── lib/             # API client
│   │   └── types/           # TypeScript types
│   └── .env.local
└── docker-compose.yml
```

## Pages

### Public Site
- **Home** — Hero, categories, featured stones, projects, why us, showroom info
- **About** — Company story, process, stats
- **Stone Catalogue** — Filterable grid (category, colour, finish, application)
- **Stone Detail** — Gallery, specs, edge profiles, enquiry modal
- **Projects** — Project portfolio with gallery
- **Project Detail** — Gallery, stones used, testimonial
- **Showroom** — Location, hours, parking, map
- **Blog** — Articles listing
- **Blog Post** — Rich content with related posts
- **Contact** — Form with project type, budget, mobile call CTA

### Admin Panel (`/admin`)
- **Dashboard** — Stats, recent enquiries, quick actions
- **Stones** — CRUD with search, table
- **Categories** — CRUD
- **Projects** — CRUD
- **Enquiries** — Status filter, detail view
- **Blog** — CRUD
- **Settings** — Showroom details

## API Endpoints

| Module | Endpoint | Methods | Auth |
|--------|----------|---------|------|
| Auth | `/api/auth` | POST login, refresh, logout | Public/Admin |
| Users | `/api/users` | GET, POST, PATCH, DELETE | Admin |
| Categories | `/api/stone-categories` | GET (Public), POST/PATCH/DELETE (Admin) | Mixed |
| Stones | `/api/stones` | GET (Public), POST/PATCH/DELETE (Admin) | Mixed |
| Projects | `/api/projects` | GET (Public), POST/PATCH/DELETE (Admin) | Mixed |
| Enquiries | `/api/enquiries` | POST (Public), GET/PATCH/DELETE (Admin) | Mixed |
| Blog | `/api/blog-posts` | GET (Public), POST/PATCH/DELETE (Admin) | Mixed |
| Showroom | `/api/showroom` | GET (Public), PATCH (Admin) | Mixed |

## Environment Variables

### Backend (.env)
```
PORT=4000
DATABASE_URL=mongodb://localhost:27017/stone-showroom
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
