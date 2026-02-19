#!/bin/bash
set -e

SERVER="root@5.129.214.77"
APP_DIR="/opt/construction-tracker"

echo "==> Deploying to $SERVER..."

ssh -o ServerAliveInterval=30 "$SERVER" bash -s << 'EOF'
set -e
cd /opt/construction-tracker

echo "==> Pulling latest changes..."
git pull

echo "==> Installing dependencies..."
pnpm install

echo "==> Pushing Prisma schema..."
cd packages/backend
npx prisma db push --skip-generate
npx prisma generate
cd ../..

echo "==> Building project..."
pnpm build

echo "==> Restarting backend..."
pm2 restart ct-backend

echo "==> Done! Deployment successful."
EOF
