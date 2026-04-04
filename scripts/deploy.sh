#!/bin/bash

# ============================================================
# Stone & Co. — Deployment Script
# ============================================================
# This script prepares and deploys both frontend and backend
# to Vercel. Run from the project root.
#
# Prerequisites:
#   1. npm install -g vercel
#   2. vercel login
#   3. MongoDB Atlas instance ready
#
# Usage:
#   bash scripts/deploy.sh              # Deploy both
#   bash scripts/deploy.sh frontend     # Frontend only
#   bash scripts/deploy.sh backend      # Backend only
#   bash scripts/deploy.sh --prod       # Production deploy
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROD_FLAG=""
TARGET="${1:-all}"

if [[ "$1" == "--prod" || "$2" == "--prod" ]]; then
  PROD_FLAG="--prod"
  echo -e "${RED}🚀 PRODUCTION DEPLOYMENT${NC}"
fi

# ---- Backend Deployment ----
deploy_backend() {
  echo -e "\n${BLUE}━━━ Deploying Backend (NestJS) ━━━${NC}"
  cd backend

  # Build
  echo -e "${YELLOW}📦 Building backend...${NC}"
  npm run build

  # Verify build
  if [ ! -f "dist/src/main.js" ]; then
    echo -e "${RED}❌ Build failed: dist/src/main.js not found${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Build successful${NC}"

  # Deploy
  echo -e "${YELLOW}☁️  Deploying to Vercel...${NC}"
  echo -e "${YELLOW}Set these environment variables in Vercel Dashboard:${NC}"
  echo "  DATABASE_URL=mongodb+srv://..."
  echo "  JWT_SECRET=<secure-random-string>"
  echo "  JWT_ACCESS_EXPIRATION=15m"
  echo "  JWT_REFRESH_EXPIRATION=7d"
  echo "  FRONTEND_URL=https://pvstone.com.au"
  echo "  NODE_ENV=production"
  echo ""

  vercel $PROD_FLAG

  cd ..
  echo -e "${GREEN}✅ Backend deployed${NC}"
}

# ---- Frontend Deployment ----
deploy_frontend() {
  echo -e "\n${BLUE}━━━ Deploying Frontend (Next.js) ━━━${NC}"
  cd frontend

  echo -e "${YELLOW}☁️  Deploying to Vercel...${NC}"
  echo -e "${YELLOW}Set these environment variables in Vercel Dashboard:${NC}"
  echo "  NEXT_PUBLIC_API_URL=https://api.pvstone.com.au/api"
  echo "  NEXT_PUBLIC_SITE_URL=https://pvstone.com.au"
  echo ""

  vercel $PROD_FLAG

  cd ..
  echo -e "${GREEN}✅ Frontend deployed${NC}"
}

# ---- Run Tests ----
run_tests() {
  echo -e "\n${BLUE}━━━ Running Tests ━━━${NC}"
  cd backend
  npx jest --no-coverage 2>&1
  cd ..
  echo -e "${GREEN}✅ All tests passed${NC}"
}

# ---- Main ----
echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Stone & Co. — Deployment Script    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"

case $TARGET in
  backend)
    run_tests
    deploy_backend
    ;;
  frontend)
    deploy_frontend
    ;;
  --prod)
    TARGET="${2:-all}"
    ;;&
  all|--prod)
    run_tests
    deploy_backend
    deploy_frontend
    ;;
  *)
    echo "Usage: bash scripts/deploy.sh [all|frontend|backend] [--prod]"
    exit 1
    ;;
esac

echo -e "\n${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Deployment Complete!         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Set environment variables in Vercel Dashboard"
echo "  2. Update FRONTEND_URL on backend with frontend URL"
echo "  3. Update NEXT_PUBLIC_API_URL on frontend with backend URL"
echo "  4. Run 'npm run seed' on backend to populate data"
echo "  5. Submit sitemap to Google Search Console"
