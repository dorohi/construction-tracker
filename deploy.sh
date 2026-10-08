#!/bin/bash
set -e

SERVER="root@5.129.214.77"
APP_DIR="/opt/construction-tracker"

cd "$(dirname "$0")"

# Сервер деплоит то, что лежит в origin — локальный HEAD должен быть запушен,
# иначе фронт (собранный локально) разойдётся с бэкендом (собранным на сервере).
git fetch -q origin
if [ -n "$(git status --porcelain)" ]; then
  echo "!! Есть незакоммиченные изменения — закоммить их перед деплоем." >&2
  exit 1
fi
if [ "$(git rev-parse HEAD)" != "$(git rev-parse '@{u}')" ]; then
  echo "!! HEAD не совпадает с upstream — сделай git push перед деплоем." >&2
  exit 1
fi

# Фронт собираем локально: на VPS (1 ГБ RAM) vite build падает по памяти.
echo "==> Building frontend locally..."
pnpm --filter shared build
pnpm --filter frontend build

echo "==> Deploying backend to $SERVER..."

ssh -o ServerAliveInterval=30 "$SERVER" bash -s << EOF
set -e
cd $APP_DIR

echo "==> Pulling latest changes..."
git pull

echo "==> Installing dependencies..."
pnpm install

echo "==> Pushing Prisma schema..."
cd packages/backend
npx prisma db push --skip-generate
npx prisma generate
cd ../..

echo "==> Building shared + backend..."
pnpm --filter shared build
pnpm --filter backend build

echo "==> Restarting backend..."
pm2 restart ct-backend
EOF

echo "==> Uploading frontend dist..."
tar czf - -C packages/frontend/dist . | ssh -o ServerAliveInterval=30 "$SERVER" bash -c "'
set -e
cd $APP_DIR/packages/frontend
rm -rf dist.new dist.old
mkdir dist.new
tar xzf - -C dist.new
mv dist dist.old
mv dist.new dist
rm -rf dist.old
'"

echo "==> Done! Deployment successful."
