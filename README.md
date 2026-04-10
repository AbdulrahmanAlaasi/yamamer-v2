# Yamamer — Al Yamamah University AI Assistant

Yamamer is the official AI-powered chatbot for Al Yamamah University (YU), built as a graduation project (GP2). It helps students get instant answers about registration, tuition, graduation requirements, financial aid, university forms, announcements, and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Django + Django REST Framework |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth (JWT) |
| Embeddings | Google Gemini `gemini-embedding-001` (768-dim) |
| AI Model | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| RAG Pipeline | Semantic search → LLM generation |

---

## Features

- **AI Chat**: Ask any question about Al Yamamah University in English or Arabic
- **RAG Pipeline**: Retrieval-Augmented Generation using real university KB data
- **University Forms**: Browse and download official university forms
- **Announcements**: View current university news and announcements
- **University Directory**: Organized sitemap of all YU sections
- **Admin Panel**: Manage the knowledge base and review unanswered questions

---

## Project Structure

```
yamamer-v2/
├── backend/                  # Django REST API
│   ├── apps/
│   │   ├── chatbot/          # Chat, RAG pipeline, KB models
│   │   ├── users/            # Supabase JWT auth
│   │   ├── admin_panel/      # Admin management
│   │   └── analytics/        # Usage analytics
│   ├── yamamer_project/      # Django settings & URLs
│   ├── seed_kb.py            # Seeds knowledge base from YU website
│   ├── seed_staff.py         # Seeds faculty profiles from YU staff sitemap
│   └── requirements.txt
├── frontend/                 # React + Vite app
│   └── src/
│       ├── pages/            # Chat, Admin, Forms, Announcements, Sitemap
│       ├── contexts/         # Auth context (Supabase)
│       └── lib/              # API client, Supabase client
├── docker-compose.yml        # Docker setup
├── STARTUP_GUIDE.md          # How to run locally
└── README.md
```

---

## Quick Start

See **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** for full instructions.

### Backend
```bash
cd backend
./venv/Scripts/activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python seed_kb.py                 # Populate knowledge base
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

---

## Environment Variables

Create `backend/.env` with:

```
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=db.your-project.supabase.co
DB_PORT=5432

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Team

Built by Computer Engineering students at Al Yamamah University — GP2, 2026.
