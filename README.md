# WMS Coffee — Warehouse Management System

Sistem manajemen gudang untuk toko kopi (bahan baku, PO, stok, produksi).

## Tech Stack

- Backend: Laravel 12 (REST API)
- Frontend: React + Vite + TypeScript + Tailwind
- Database: PostgreSQL
- Cache/Queue: Redis
- Auth: Laravel Sanctum

## Prasyarat

- PHP 8.3+
- Composer
- Node.js 20+
- PostgreSQL 15+
- Redis (native atau Docker)

## Cara Install

### 1. Clone repo

\`\`\`bash
git clone <repo-url> wms-coffee
cd wms-coffee
\`\`\`

### 2. Setup Backend

\`\`\`bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
\`\`\`

### 3. Setup Frontend

\`\`\`bash
cd frontend
npm install
cp .env.example .env
npm run dev
\`\`\`

### 4. Jalankan Redis

\`\`\`bash
docker run -d --name wms_redis -p 6379:6379 redis:7-alpine
\`\`\`

## Struktur Folder

- `backend/` — Laravel REST API
- `frontend/` — React SPA
- `docs/` — dokumentasi ERD & API spec
