# AniRyu - Anime & Manga List Tracker

A modern, full-stack application for tracking your anime and manga collection with beautiful statistics and bulk management features.

<div align="center">
  <img src="screenshots/anime.png" alt="AniRyu Anime List" width="800"/>
  <p><em>Beautiful, modern interface for managing your anime and manga collection</em></p>
</div>

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Go** (v1.19 or higher) - [Download here](https://golang.org/dl/)
- **pnpm** (recommended) or npm

### Easy Setup (Windows)
1. **Clone the repository**
   ```bash
   git clone https://github.com/KronosWasTaken/AniRyu.git
   cd AniRyu
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   
   **Note**: If you encounter esbuild errors, run:
   ```bash
   pnpm config set enable-pre-post-scripts true
   pnpm add -D esbuild
   ```

### Easy Setup
- **Windows**: Double-click `start.bat` or run it in your terminal.
- **Linux/macOS/Dev Container**: Run `./bash_start.sh` to start both servers.

These scripts will automatically handle starting the backend and frontend for you.

### Docker Setup (Recommended)
The easiest way to run AniRyu is using Docker. This handles all dependencies (Node, Go, etc.) for you in a single command.

1. **Install Docker Desktop** from [docker.com](https://www.docker.com/)
2. **Run the application**:
   - **For Development (Auto-updates)**:
     ```powershell
     docker compose watch
     ```
     *This will automatically rebuild the container when you change your code.*
   - **For Standard Run**:
     ```powershell
     docker compose up --build
     ```
3. **Access the app** at http://localhost:8080

**Note**: Your data is automatically saved in the `./data` folder and will persist even if you stop or rebuild the container.

### Manual Setup
If you prefer to run servers separately:

```bash
# Terminal 1 - Backend
cd backend
go run cmd/server/main.go

# Terminal 2 - Frontend  
pnpm run dev
```

## 🧰 Dev environments: mise · devenv · direnv · SOPS · Portless

Two lanes — pick **one** for PATH/tools (upstream advises against mixing mise with
direnv on PATH: https://mise.jdx.dev/direnv.html):

| Lane | Platform | Setup |
|---|---|---|
| **A: devenv + direnv** (Nix, reproducible) | Linux / macOS / WSL2 | `nix install` → `direnv allow` → `devenv up` |
| **B: mise** (no Nix) | Windows / anywhere | `winget install jdx.mise` → `mise install` → `mise run dev` |

`./scripts/doctor.sh` (or `mise run doctor`) checks all five tools.

```bash
# Lane A — plain ports (localhost:5173 + localhost:3001)
devenv up
# Lane B — plain ports
mise run dev

# Named URLs via Portless (https://aniryu.localhost + https://api.aniryu.localhost)
portless trust            # once: local CA + port 443 (needs admin/sudo)
mise run dev:named        # or: pnpm dev:named (+ backend separately)
```

**Secrets (SOPS/age)** — plaintext never committed; only `*.enc.env` is:

```bash
./scripts/sops-setup.sh    # generate age key, paste age1... into .sops.yaml
cp secrets/dev.example.env secrets/dev.env   # fill in, then:
./scripts/sops-encrypt.sh  # -> secrets/dev.enc.env + backend/dev.enc.env (commit)
./scripts/sops-decrypt.sh  # -> .env.local + backend/.env (gitignored, auto-loaded by direnv)
```

**Files**: `mise.toml` (tools/env/tasks) · `devenv.nix` + `devenv.yaml` (Nix lane) ·
`.envrc` (Lane A activation + dotenv) · `.sops.yaml` + `secrets/` · `portless.json`
(frontend name `aniryu`; backend runs as `api.aniryu`). The frontend derives the API
URL from `window.location`, so plain and named modes both work with no extra config.

## 🌐 Access Points
- **Frontend**: http://localhost:5173 (or http://localhost:8080 if using Docker)
- **Backend API**: http://localhost:3001
- **Import Page**: http://localhost:5173/import (or http://localhost:8080/import if using Docker)

## ✨ Features
- 📺 **Anime & Manga Tracking** - Add, edit, and manage your collection
- 📊 **Beautiful Statistics** - Comprehensive analytics and progress tracking
- 🔄 **Bulk Operations** - Select multiple items for batch updates
- 🎨 **Modern UI** - Dark theme with smooth animations
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔍 **Advanced Search** - Find anime/manga with powerful filtering
- 📈 **Progress Tracking** - Monitor your watch/read progress
- ⭐ **Rating System** - Rate your favorite shows and books

## 📸 Screenshots

### Main Interface
![Anime List](screenshots/anime.png)
*Clean and modern anime list interface with beautiful cards*

![Manga List](screenshots/manga.png)
*Organized manga collection with progress tracking*

### Key Features
![Add New Entry](screenshots/add_new.png)
*Easy-to-use form for adding new anime or manga*

![Edit Entry](screenshots/edit.png)
*Comprehensive editing interface with all details*

![Import from AniList](screenshots/import.png)
*Seamless import from AniList with progress tracking*

![Deleted Entries](screenshots/deleted.png)
*Manage deleted entries with restore functionality*

## 🛠️ Tech Stack

### Frontend
- **React 19** - Cutting-edge UI library
- **TypeScript 6** - Strict type-safe development
- **Vite 8** - Ultra-fast build tool with Rolldown & Oxc
- **Tailwind CSS v4** - Modern CSS-first utility framework
- **shadcn/ui** - Beautiful component library
- **Framer Motion** - Smooth animations
- **React Router 7** - Modern client-side routing

### Backend
- **Go** - High-performance server
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **SQLite** - Lightweight database

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📁 Project Structure
```
AniRyu/
├── backend/                 # Go backend server
│   ├── cmd/server/         # Main server entry point
│   ├── internal/           # Internal packages
│   │   ├── handlers/       # HTTP handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/  # Data access layer
│   │   └── models/         # Data models
│   └── data/              # Database files (ignored by git)
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── types/             # TypeScript definitions
├── public/                 # Static assets
├── start.bat              # Windows startup script
└── bash_start.sh          # Linux/macOS/Dev Container startup script
```

## 🔧 Development

### Available Scripts
```bash
# Frontend
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run preview       # Preview production build

# Backend
go run cmd/server/main.go    # Start Go server

### Development Container
This project includes a **Dev Container** configuration for VS Code. To use it:
1. Open this folder in VS Code.
2. Click the blue button in the bottom-left corner and select **"Reopen in Container"**.
3. All tools (Node 24, Go 1.21, pnpm) will be automatically configured for you.
4. **Once inside**, simply run:
   ```bash
   ./bash_start.sh
   ```
```

## 🚀 Deployment
1. Build the frontend: `pnpm run build`
2. Deploy the backend Go server
3. Serve the built frontend files

## 📝 License
This project is for personal use. Please respect AniList's API terms of service.
