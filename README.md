# AniRyu - Anime & Manga List Tracker

A modern, full-stack application for tracking your anime and manga collection with beautiful statistics and bulk management features.

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

3. **Run the application**
   ```bash
   # Double-click start.bat or run:
   start.bat
   ```

That's it! The application will start both the backend and frontend servers automatically.

### Manual Setup
If you prefer to run servers separately:

```bash
# Terminal 1 - Backend
cd backend
go run cmd/server/main.go

# Terminal 2 - Frontend  
pnpm run dev
```

## 🌐 Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Import Page**: http://localhost:5173/import

## ✨ Features
- 📺 **Anime & Manga Tracking** - Add, edit, and manage your collection
- 📊 **Beautiful Statistics** - Comprehensive analytics and progress tracking
- 🔄 **Bulk Operations** - Select multiple items for batch updates
- 🎨 **Modern UI** - Dark theme with smooth animations
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔍 **Advanced Search** - Find anime/manga with powerful filtering
- 📈 **Progress Tracking** - Monitor your watch/read progress
- ⭐ **Rating System** - Rate your favorite shows and books

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing

### Backend
- **Go** - High-performance server
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **SQLite** - Lightweight database

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Lovable Tagger** - Component tagging

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
└── start.bat              # Windows startup script
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
```

## 🚀 Deployment
1. Build the frontend: `pnpm run build`
2. Deploy the backend Go server
3. Serve the built frontend files

## 📝 License
This project is for personal use. Please respect AniList's API terms of service.
