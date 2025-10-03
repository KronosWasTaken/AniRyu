# AniList Backend

A Go backend service for tracking anime and manga, built with Gin framework and following clean architecture principles.

## Features

- **Anime & Manga Tracking**: Track your anime and manga with status, progress, and scores
- **AniList Integration**: Search and import from AniList API
- **RESTful API**: Clean REST API endpoints
- **SQLite Database**: Lightweight database for local storage
- **Clean Architecture**: Modular, testable, and maintainable code structure

## Architecture

```
backend/
├── cmd/
│   └── server/           # Application entry point
├── internal/
│   ├── config/           # Configuration management
│   ├── database/         # Database initialization
│   ├── handlers/         # HTTP handlers (controllers)
│   ├── middleware/       # HTTP middleware
│   ├── models/           # Data models
│   ├── repositories/     # Data access layer
│   └── services/         # Business logic layer
├── go.mod
├── go.sum
└── Makefile
```

## API Endpoints

### Anime
- `GET /api/list/anime` - Get anime list
- `POST /api/list/anime` - Add anime
- `PUT /api/list/anime/:id` - Update anime
- `DELETE /api/list/anime/:id` - Delete anime

### Manga
- `GET /api/list/manga` - Get manga list
- `POST /api/list/manga` - Add manga
- `PUT /api/list/manga/:id` - Update manga
- `DELETE /api/list/manga/:id` - Delete manga

### Search
- `GET /api/search?query=<search_term>` - Search AniList

### Utility
- `GET /api/rating_type` - Get rating type configuration
- `GET /health` - Health check

## Quick Start

### Prerequisites

- Go 1.21 or later
- SQLite3

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   make deps
   ```

3. **Run in development mode:**
   ```bash
   make dev
   ```

4. **Or build and run:**
   ```bash
   make build
   make run
   ```

### Configuration

Create a `.env` file in the backend directory (copy from `config.env.example`):

```env
# Server Configuration
PORT=8080
HOST=localhost

# Database Configuration
DB_PATH=./data/list.db

# CORS Configuration
ALLOWED_ORIGINS=*

# AniList API Configuration
ANILIST_API_URL=https://graphql.anilist.co

# Rating Configuration
RATING_TYPE=stars
```

## Development

### Available Commands

```bash
make help          # Show all available commands
make deps          # Install dependencies
make build         # Build the application
make run           # Build and run
make dev           # Run in development mode
make test          # Run tests
make test-coverage # Run tests with coverage
make fmt           # Format code
make lint          # Lint code
make clean         # Clean build artifacts
```

### Code Structure

The project follows clean architecture principles:

- **Handlers**: HTTP request/response handling
- **Services**: Business logic and use cases
- **Repositories**: Data access and persistence
- **Models**: Domain entities and data structures
- **Config**: Application configuration
- **Database**: Database initialization and migrations

### Testing

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage
```

### Linting

```bash
# Install linting tools
make install-tools

# Run linter
make lint
```

## Database Schema

### Anime Table
```sql
CREATE TABLE anime (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    media_id INTEGER UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning',
    score INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    image TEXT,
    notes TEXT,
    is_adult BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME
);
```

### Manga Table
```sql
CREATE TABLE manga (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    media_id INTEGER UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning',
    score INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    image TEXT,
    notes TEXT,
    is_adult BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    deleted_at DATETIME
);
```

## API Examples

### Get Anime List
```bash
curl http://localhost:8080/api/list/anime
```

### Add Anime
```bash
curl -X POST http://localhost:8080/api/list/anime \
  -H "Content-Type: application/json" \
  -d '{"media_id": 12345, "media_type": "anime"}'
```

### Update Anime
```bash
curl -X PUT http://localhost:8080/api/list/anime/12345 \
  -H "Content-Type: application/json" \
  -d '{"progress": 5, "score": 8, "status": "watching"}'
```

### Search AniList
```bash
curl "http://localhost:8080/api/search?query=attack%20on%20titan"
```

## Migration from Python/Flask

This Go backend maintains API compatibility with the original Python/Flask implementation:

- Same endpoint structure (`/api/list/anime`, `/api/list/manga`, etc.)
- Same request/response formats
- Same database schema
- Same AniList API integration

## Deployment

### Build for Production
```bash
make build
```

### Run Production Binary
```bash
./build/anilist-backend
```

### Docker (Optional)
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o anilist-backend cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/anilist-backend .
CMD ["./anilist-backend"]
```

## Contributing

1. Follow Go best practices and clean architecture principles
2. Write tests for new features
3. Use `make fmt` and `make lint` before committing
4. Update documentation as needed

## License

This project is open source and available under the MIT License.
