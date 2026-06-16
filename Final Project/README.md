# StreamHub

StreamHub is a database-driven content discovery and routing portal. Administrators control every destination, category, tag, logo, and URL through Django Admin. Visitors search and browse the catalog, then use a tracked redirect endpoint that records analytics before sending them to the saved destination.

## Stack

- Django 5 + Django REST Framework
- SQLite for development, configurable through environment variables
- React 18 + Vite
- Responsive dark UI, React Helmet metadata, Recharts analytics
- Docker + Nginx + Gunicorn

## Project structure

```text
Final Project/
├── backend/
│   ├── analytics/       # Click model and protected dashboard API
│   ├── config/          # Django settings and root URLs
│   ├── platforms/       # Catalog models, APIs, admin, redirect, sitemap
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   └── package.json
└── docker-compose.yml
```

## Local setup

Run the backend commands from `Final Project/backend` and the frontend commands from `Final Project/frontend`.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo
python manage.py runserver
```

The API and admin are available at `http://127.0.0.1:8000/api/` and `http://127.0.0.1:8000/admin/`.

On Windows projects inside OneDrive, the default SQLite file is placed at `%LOCALAPPDATA%\StreamHub\db.sqlite3` to avoid sync-locking errors. Set `DB_NAME` in `backend/.env` to override it.

### Frontend

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies API, media, admin, sitemap, and robots requests to Django.

## Admin workflow

1. Create categories and tags.
2. Add a platform with a name, description, category, optional tags/logo, and an HTTP(S) destination URL.
3. Keep `is_active` enabled to publish it.
4. Visit `/platform/<slug>` and click **Watch now**.
5. StreamHub requests `/api/platforms/<slug>/redirect/`, logs the click, validates that the saved destination is HTTP(S), and returns a redirect.

Destination URLs are never supplied by visitors. The redirect endpoint resolves only active database records, preventing arbitrary open redirects.

## API documentation

All list endpoints return JSON. Platform lists are paginated with `count`, `next`, `previous`, and `results`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/platforms/` | Public | Active platforms |
| `GET` | `/api/platforms/<slug>/` | Public | Platform detail and related items |
| `GET` | `/api/platforms/<slug>/redirect/` | Public, throttled | Log and redirect |
| `GET` | `/api/categories/` | Public | Categories containing active platforms |
| `GET` | `/api/tags/` | Public | Tags used by active platforms |
| `GET` | `/api/analytics/dashboard/?days=30` | Staff only | Metrics, trends, rankings, recent logs |
| `GET` | `/sitemap.xml` | Public | Active platform sitemap |
| `GET` | `/robots.txt` | Public | Crawler directives |

Platform query parameters:

- `search=<text>` searches names, descriptions, categories, and tags.
- `category__slug=<slug>` filters by category.
- `tags__slug=<slug>` filters by tag.
- `ordering=created_at`, `ordering=name`, or `ordering=click_count`.
- `section=trending` ranks by clicks in the last 30 days.
- `section=recent` returns newest entries first.
- `page=<number>&page_size=<1-50>` controls pagination.

Example:

```http
GET /api/platforms/?search=learning&category__slug=education&tags__slug=free
```

## Security notes

- Django CSRF middleware remains enabled; session-authenticated APIs enforce CSRF.
- Analytics require an authenticated staff account.
- Redirects are rate-limited and use only active, validated database URLs.
- URL credentials and non-HTTP(S) schemes are rejected.
- Uploaded logos are extension-limited. Production deployments should additionally use object storage and malware scanning.
- Secure cookies and common security headers are enabled automatically when `DJANGO_DEBUG=False`.
- Set a strong `DJANGO_SECRET_KEY`, correct host/origin values, HTTPS, and `SECURE_SSL_REDIRECT=True` in production.
- After confirming HTTPS works on every subdomain, set `SECURE_HSTS_SECONDS=31536000` and optionally enable the HSTS subdomain/preload flags.

## Tests and checks

```powershell
cd backend
python manage.py test
python manage.py check --deploy

cd ..\frontend
npm run lint
npm run build
```

## Docker

Create a root `.env` containing a strong secret, then run:

```powershell
$env:DJANGO_SECRET_KEY="replace-with-a-long-random-value"
docker compose up --build
docker compose exec backend python manage.py createsuperuser
```

Open `http://localhost`. SQLite and uploaded media are kept in named Docker volumes. For a multi-instance production deployment, switch to PostgreSQL and shared object storage.
