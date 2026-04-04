# Deployment Guide — Vercel

## Architecture on Vercel

```
┌──────────────────────┐      ┌──────────────────────┐      ┌─────────────┐
│  Vercel (Frontend)   │      │  Vercel (Backend)     │      │  MongoDB    │
│  Next.js 14          │─────>│  NestJS Serverless    │─────>│  Atlas      │
│  stone-frontend.     │ API  │  stone-backend.       │      │  (Free/M0)  │
│  vercel.app          │      │  vercel.app           │      │             │
└──────────────────────┘      └──────────────────────┘      └─────────────┘
```

## Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [MongoDB Atlas](https://www.mongodb.com/atlas) (free M0 tier works)
3. Vercel CLI: `npm install -g vercel`

---

## Step 1: Set Up MongoDB Atlas

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster (choose **Sydney** region for AU)
3. Create a database user with password
4. Add `0.0.0.0/0` to IP Access List (required for Vercel serverless)
5. Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/stone-showroom
   ```

## Step 2: Deploy Backend

```bash
cd backend

# Login to Vercel
vercel login

# Build first
npm run build

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add DATABASE_URL          # paste MongoDB Atlas URL
vercel env add MONGODB_URI           # same as DATABASE_URL (recommended)
vercel env add JWT_SECRET            # generate: openssl rand -hex 32
vercel env add JWT_ACCESS_EXPIRATION # 15m
vercel env add JWT_REFRESH_EXPIRATION # 7d
vercel env add FRONTEND_URL          # https://your-frontend.vercel.app
vercel env add NODE_ENV              # production
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET

# Production deploy
vercel --prod
```

**Note your backend URL** (e.g., `https://stone-backend.vercel.app`)

## Step 3: Seed Database

```bash
# Set MONGODB_URI or DATABASE_URL locally first
export MONGODB_URI="mongodb+srv://..."

# Run seed
npm run seed:standalone
```

## Step 4: Deploy Frontend

```bash
cd frontend

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL   # https://stone-backend.vercel.app/api
vercel env add NEXT_PUBLIC_SITE_URL  # https://your-frontend.vercel.app
vercel env add GEMINI_API_KEY
vercel env add GEMINI_MODEL          # gemini-3.1-pro-preview
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

# Production deploy
vercel --prod
```

## Step 5: Custom Domain (Optional)

```bash
# Frontend
vercel domains add vpstonemason.vercel.app --cwd frontend

# Backend
vercel domains add vpstonemason-api.vercel.app --cwd backend
```

---

## Quick Deploy Script

```bash
# From project root
bash scripts/deploy.sh              # Deploy both (preview)
bash scripts/deploy.sh --prod       # Deploy both (production)
bash scripts/deploy.sh frontend     # Frontend only
bash scripts/deploy.sh backend      # Backend only
```

---

## Environment Variables Reference

### Backend

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/stone-showroom` |
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/stone-showroom` |
| `JWT_SECRET` | ✅ | `a1b2c3d4...` (random 64 char hex) |
| `JWT_ACCESS_EXPIRATION` | ❌ | `15m` |
| `JWT_REFRESH_EXPIRATION` | ❌ | `7d` |
| `FRONTEND_URL` | ✅ | `https://vpstonemason.vercel.app` |
| `NODE_ENV` | ✅ | `production` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | ✅ | `1234567890` |
| `CLOUDINARY_API_SECRET` | ✅ | `xxxxxxxx` |

### Frontend

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://vpstonemason-api.vercel.app/api` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://vpstonemason.vercel.app` |
| `GEMINI_API_KEY` | ✅ | `AIza...` |
| `GEMINI_MODEL` | ✅ | `gemini-3.1-pro-preview` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | ✅ | `1234567890` |
| `CLOUDINARY_API_SECRET` | ✅ | `xxxxxxxx` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | `your-cloud-name` |

---

## Post-Deployment Checklist

- [ ] Verify frontend loads at your URL
- [ ] Test admin login at `/admin/login`
- [ ] Submit enquiry on `/contact`
- [ ] Check `/sitemap.xml` generates correctly
- [ ] Check `/robots.txt` is correct
- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console)
- [ ] Set up [Google Business Profile](https://business.google.com/) linking to website
- [ ] Run [Lighthouse](https://web.dev/measure/) audit (target: 90+)
- [ ] Verify JSON-LD with [Schema.org Validator](https://validator.schema.org/)
- [ ] Test OG tags with [Open Graph Debugger](https://developers.facebook.com/tools/debug/)
