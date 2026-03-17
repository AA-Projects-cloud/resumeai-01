# AI Resume Builder SaaS 🚀

A full-stack, production-ready AI-powered Resume Builder platform.

**Stack:** React (Vite) • Node.js • Express • Supabase • Clerk Auth • Grok AI

---

## 🗂 Project Structure

```
ResumeAi/
├── frontend/          # React + Vite + TailwindCSS + Recharts
├── backend/           # Node.js + Express API
├── supabase_schema.sql  # Run this in Supabase SQL Editor
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env   # Fill in your API keys
npm install
node server.js         # Runs on http://localhost:3001
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env   # Fill in Clerk key + API URL
npm install
npm run dev            # Runs on http://localhost:5173
```

---

## 🔑 Required API Keys

| Service | Where to get | .env variable |
|---------|-------------|---------------|
| **Clerk** (Auth) | [clerk.com](https://clerk.com) → Create app | `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` |
| **Supabase** (Database) | [supabase.com](https://supabase.com) → New project | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Grok AI** | [console.x.ai](https://console.x.ai) | `GROK_API_KEY` |

---

## 🗄 Supabase Setup

1. Create a new Supabase project
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase_schema.sql`
4. Copy the **Project URL**, **anon key**, and **service_role key** into `backend/.env`

---

## 🔐 Clerk Setup

1. Create a new app at [clerk.com](https://clerk.com)
2. Enable **Email + Password** and **Google OAuth** (optional)
3. Copy the **Publishable Key** → `frontend/.env` as `VITE_CLERK_PUBLISHABLE_KEY`
4. Copy the **Secret Key** → `backend/.env` as `CLERK_SECRET_KEY`

---

## 🤖 Grok AI Setup

1. Go to [console.x.ai](https://console.x.ai)
2. Create an API key
3. Set `GROK_API_KEY` in `backend/.env`

The model used is **`grok-3-latest`** — change in `backend/services/grokService.js`.

---

## 🌐 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Server health check |
| GET | `/resume/list` | List all user resumes |
| POST | `/resume/create` | Create new resume |
| PUT | `/resume/update/:id` | Update resume |
| DELETE | `/resume/delete/:id` | Delete resume |
| POST | `/ai/generate` | Generate full resume with Grok AI |
| POST | `/ai/improve` | Improve specific content |
| POST | `/export/pdf` | Download as PDF |
| POST | `/export/docx` | Download as DOCX |
| POST | `/export/txt` | Download as TXT |
| GET | `/analytics` | Get analytics data |

---

## ✨ Features

- 🔐 **Clerk Authentication** — Sign up, sign in, Google OAuth
- 🤖 **Grok AI** — Generate ATS-optimized resumes, improve bullet points
- 📊 **Analytics Dashboard** — Recharts charts for skills, completion, timeline
- 📄 **Multi-format Export** — PDF, DOCX, TXT
- 🌙 **Dark / Light Theme** — Persisted via localStorage
- ☁️ **Cloud Storage** — Supabase PostgreSQL
- ⚡ **Rate Limiting** — API protection built in
- 📱 **Responsive Design** — Works on all screen sizes

---

## 🏗 Resume Types & Tones

**Types:** Fresher • Developer • Internship • Experienced

**Tones:** Professional • Simple • Impact Focused

---

Built with ❤️ using React, Node.js, Supabase, Clerk & Grok AI
