FROM node:24-alpine AS frontend-builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
ENV VITE_API_BASE_URL=/api
RUN pnpm build

FROM golang:1.21-alpine AS backend-builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN go build -o main ./cmd/server/main.go

FROM alpine:latest
RUN apk add --no-cache nginx ca-certificates tzdata

WORKDIR /app

COPY --from=frontend-builder /app/dist /usr/share/nginx/html

COPY --from=backend-builder /app/main /app/backend-api
COPY backend/config.env.example /app/.env

COPY nginx.conf /etc/nginx/http.d/default.conf

COPY scripts/start.sh /app/start.sh
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

ENV HOST=0.0.0.0
ENV PORT=3001
ENV DB_PATH=/app/data/aniryu.db
ENV GIN_MODE=release

EXPOSE 80

CMD ["/app/start.sh"]
