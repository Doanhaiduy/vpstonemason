#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_ENV="${ROOT_DIR}/backend/.env"
FRONTEND_ENV="${ROOT_DIR}/frontend/.env.local"

if [[ ${1:-} == "" ]]; then
  echo "Usage: bash scripts/generate-vps-env.sh <SERVER_IP_OR_URL> [OUTPUT_FILE]"
  echo "Example: bash scripts/generate-vps-env.sh pvstone.com.au .env.vps.prd"
  exit 1
fi

SERVER_INPUT="$1"
OUTPUT_FILE="${2:-${ROOT_DIR}/.env.vps.prd}"

if [[ ! -f "$BACKEND_ENV" ]]; then
  echo "Missing file: $BACKEND_ENV"
  exit 1
fi

if [[ ! -f "$FRONTEND_ENV" ]]; then
  echo "Missing file: $FRONTEND_ENV"
  exit 1
fi

if [[ "$SERVER_INPUT" =~ ^https?:// ]]; then
  BASE_URL="${SERVER_INPUT%/}"
elif [[ "$SERVER_INPUT" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  BASE_URL="http://${SERVER_INPUT}"
else
  BASE_URL="https://${SERVER_INPUT}"
fi

get_value() {
  local file="$1"
  local key="$2"
  local line
  line="$(grep -E "^${key}=" "$file" | tail -n1 || true)"
  if [[ -z "$line" ]]; then
    echo ""
  else
    echo "${line#*=}"
  fi
}

require_value() {
  local value="$1"
  local key="$2"
  if [[ -z "$value" ]]; then
    echo "Missing required key '${key}'"
    exit 1
  fi
}

DATABASE_URL="$(get_value "$BACKEND_ENV" "DATABASE_URL")"
MONGODB_URI="$(get_value "$BACKEND_ENV" "MONGODB_URI")"
JWT_SECRET="$(get_value "$BACKEND_ENV" "JWT_SECRET")"
JWT_ACCESS_EXPIRATION="$(get_value "$BACKEND_ENV" "JWT_ACCESS_EXPIRATION")"
JWT_REFRESH_EXPIRATION="$(get_value "$BACKEND_ENV" "JWT_REFRESH_EXPIRATION")"
THROTTLE_TTL="$(get_value "$BACKEND_ENV" "THROTTLE_TTL")"
THROTTLE_LIMIT="$(get_value "$BACKEND_ENV" "THROTTLE_LIMIT")"
CLOUDINARY_CLOUD_NAME="$(get_value "$BACKEND_ENV" "CLOUDINARY_CLOUD_NAME")"
CLOUDINARY_API_KEY="$(get_value "$BACKEND_ENV" "CLOUDINARY_API_KEY")"
CLOUDINARY_API_SECRET="$(get_value "$BACKEND_ENV" "CLOUDINARY_API_SECRET")"

GEMINI_API_KEY="$(get_value "$FRONTEND_ENV" "GEMINI_API_KEY")"
GEMINI_MODEL="$(get_value "$FRONTEND_ENV" "GEMINI_MODEL")"

require_value "$DATABASE_URL" "DATABASE_URL"
require_value "$MONGODB_URI" "MONGODB_URI"
require_value "$JWT_SECRET" "JWT_SECRET"

JWT_ACCESS_EXPIRATION="${JWT_ACCESS_EXPIRATION:-15m}"
JWT_REFRESH_EXPIRATION="${JWT_REFRESH_EXPIRATION:-7d}"
THROTTLE_TTL="${THROTTLE_TTL:-60}"
THROTTLE_LIMIT="${THROTTLE_LIMIT:-100}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.5-flash}"

cat > "$OUTPUT_FILE" <<EOF
# Generated from backend/.env and frontend/.env.local
# Review before upload to VPS. Do NOT commit this file.

NEXT_PUBLIC_SITE_URL=${BASE_URL}
NEXT_PUBLIC_API_URL=${BASE_URL}/api
INTERNAL_API_URL=http://backend:4000/api
FRONTEND_URL=${BASE_URL}

PORT=4000
NODE_ENV=production

DATABASE_URL=${DATABASE_URL}
MONGODB_URI=${MONGODB_URI}

JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_EXPIRATION=${JWT_ACCESS_EXPIRATION}
JWT_REFRESH_EXPIRATION=${JWT_REFRESH_EXPIRATION}
THROTTLE_TTL=${THROTTLE_TTL}
THROTTLE_LIMIT=${THROTTLE_LIMIT}

CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}

GEMINI_API_KEY=${GEMINI_API_KEY}
GEMINI_MODEL=${GEMINI_MODEL}
EOF

echo "Generated: $OUTPUT_FILE"
echo "Next: scp '$OUTPUT_FILE' <user>@<vps_ip_or_host>:/opt/vpstonemason/.env"
