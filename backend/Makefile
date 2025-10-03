# Makefile for AniList Backend

.PHONY: build run test clean deps dev

# Variables
BINARY_NAME=anilist-backend
BUILD_DIR=build
MAIN_PATH=cmd/server/main.go

# Default target
all: deps build

# Install dependencies
deps:
	go mod download
	go mod tidy

# Build the application
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

# Run the application
run: build
	@echo "Starting $(BINARY_NAME)..."
	./$(BUILD_DIR)/$(BINARY_NAME)

# Run in development mode
dev:
	@echo "Starting $(BINARY_NAME) in development mode..."
	go run $(MAIN_PATH)

# Run tests
test:
	@echo "Running tests..."
	go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html

# Format code
fmt:
	@echo "Formatting code..."
	go fmt ./...

# Lint code
lint:
	@echo "Linting code..."
	golangci-lint run

# Install development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Database operations
db-migrate:
	@echo "Running database migrations..."
	go run $(MAIN_PATH) migrate

# Help
help:
	@echo "Available targets:"
	@echo "  build         - Build the application"
	@echo "  run           - Build and run the application"
	@echo "  dev           - Run in development mode"
	@echo "  test          - Run tests"
	@echo "  test-coverage - Run tests with coverage"
	@echo "  clean         - Clean build artifacts"
	@echo "  fmt           - Format code"
	@echo "  lint          - Lint code"
	@echo "  deps          - Install dependencies"
	@echo "  install-tools - Install development tools"
