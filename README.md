<div align="center">

# 🏥 MediScan

### AI-Powered Medicine Analysis Platform

Analyze Medicine Images instantly with the power of AI — fast, accurate, and built for healthcare professionals in 8 indian languages. 

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.io/)

[Live Demo](https://medi-scan-rt86.vercel.app/) · [Report Bug](https://github.com/TusharAmbast/MediScan/issues) · [Request Feature](https://github.com/TusharAmbast/MediScan/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🔍 About the Project

**MediScan** is a full-stack web application that leverages AI to analyze medicine images and also give medicine recommendations with proper dosage and side effects. It provides healthcare professionals with fast, reliable insights directly from a browser — no specialized software required.

Upload a scan, get an analysis. That simple.

---

## ✨ Features

- 🩻 **Medical Image Analysis** — Upload and analyze Medicine scans using AI
- ⚡ **Fast Results** — Get analysis feedback within seconds
- 🔐 **Secure** — Patient data handled with care; no images stored permanently
- 📱 **Responsive UI** — Works on desktop and mobile browsers
- 📊 **Multilingual** — View the results in 8 different Indian languages

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | TypeScript, React / Next.js |
| **Backend** | Python, FastAPI |
| **Database** | PostgreSQL |
| **Hosting** | Vercel (Frontend), Railway (Backend), Supabase (DB) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Client                          │
│           TypeScript / React Frontend                │
│                  (Vercel)                            │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                   FastAPI Backend                    │
│          Image Processing + AI Analysis              │
│                  (Railway)                           │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  PostgreSQL Database                 │
│            Users, Scans, Results Storage             │
│                  (Supabase)                          │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [Git](https://git-scm.com/)



### Option 1 — Run Manually 

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies

# 1. Install CPU-only PyTorch first to save 3GB+ of space
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# 2. Install the rest of the dependencies
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env
# Edit .env with your database URL and secret key

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000

# API will be live at http://localhost:8000
# Swagger docs at  http://localhost:8000/docs
```

#### Frontend Setup

```bash
# Open a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy and configure env
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev

# Frontend will be live at http://localhost:3000
```

#### Database Setup

```bash
# Navigate to database folder
cd database

# Run the schema SQL against your PostgreSQL instance
psql -U your_user -d your_database -f schema.sql
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Secret key for JWT / sessions | `your-random-secret-key` |
| `ALLOWED_ORIGINS` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

> ⚠️ Never commit `.env` files. They are listed in `.gitignore`.

---

## 📡 API Reference

Once the backend is running, interactive API docs are available at:

```
http://localhost:8000/docs       ← Swagger UI
http://localhost:8000/redoc      ← ReDoc
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/scan` | Upload and analyze a medical image |
| `GET` | `/api/scans` | Retrieve all past scan results |
| `GET` | `/api/scans/{id}` | Get a specific scan result |
| `DELETE` | `/api/scans/{id}` | Delete a scan record |

---

## ☁️ Deployment

MediScan is deployed across three free/low-cost platforms:

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | [Vercel](https://vercel.com) | Auto-deployed on push to `main` |
| Backend | [Railway](https://railway.app) | Auto-deployed on push to `main` |
| Database | [Supabase](https://supabase.com) | Managed PostgreSQL |

For a full step-by-step deployment guide, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to the branch
git push origin feature/your-feature-name

# 5. Open a Pull Request on GitHub
```

Please make sure your code follows the existing style and includes relevant comments.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Tushar Ambast](https://github.com/TusharAmbast)

</div>
