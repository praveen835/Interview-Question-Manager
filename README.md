# Interview Question Manager

A full-stack app for collecting, organizing, and practicing interview questions.

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer and npm

## Backend

From the project root, create and activate a virtual environment, then install the backend requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements-dev.txt
Set-Location backend
python -m uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

## Frontend

Open a second terminal at the project root:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://127.0.0.1:5173`.

By default, the frontend connects to `http://127.0.0.1:8000`. To use a different API URL, create `frontend/.env.local` with:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

The SQLite database is created locally in the backend working directory and is intentionally excluded from Git.

## Tests

With the virtual environment active, run the backend API tests from the backend directory:

```powershell
Set-Location backend
python -m pytest
```
