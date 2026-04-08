# Al Yamamah University Assistant (Yamamer-v2) - Startup Guide

This guide explains how to start the Yamamer-v2 application on your laptop for your supervisor presentation.

## Prerequisites
Ensure the following are installed:
- **Node.js** (v18+)
- **Python** (v3.9+)
- **PostgreSQL** (or Docker to run the database)

---

## 1. Start the Database
If you are using Docker, run:
```powershell
docker-compose up -d
```
Otherwise, ensure your local PostgreSQL service is running and the database specified in `backend/.env` exists.

---

## 2. Start the Backend (Django)
Open a new terminal in the `backend` folder:

```powershell
# Activate virtual environment
./venv/Scripts/activate

# Install requirements (if not already done)
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Seed data (Knowledge Base, Forms, Announcements)
# This will populate the app with the sitemap data!
python seed_kb.py

# Start the server
python manage.py runserver
```
The backend is now live at: `http://127.0.0.1:8000`

---

## 3. Start the Frontend (Vite/React)
Open a second terminal in the `frontend` folder:

```powershell
# Install dependencies (only required once)
npm install

# Start the development server
npm run dev
```
The frontend is now live at: `http://localhost:5173`

---

## Presentation Checklist
- [ ] **Home Page**: Show the AI Chat capability (ask about tuition or documents).
- [ ] **University Directory**: Click the **Search icon** in the header to show the organized sitemap links.
- [ ] **University Forms**: Click the **File icon** to show the populated forms.
- [ ] **Announcements**: Click the **Megaphone icon** to show current university news.
- [ ] **Admin Panel**: Log in to show how admins manage the knowledge base.
