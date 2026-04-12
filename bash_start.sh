#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   AniRyu Development Environment       ${NC}"
echo -e "${CYAN}========================================${NC}"
echo

cleanup() {
    echo -e "\n${BLUE}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}[1/2] Starting Go Backend Server...${NC}"
cd "$DIR/backend"
go run cmd/server/main.go &
BACKEND_PID=$!

echo -e "${GREEN}[2/2] Starting React Frontend...${NC}"
cd "$DIR"
pnpm run dev &
FRONTEND_PID=$!

echo
echo -e "${CYAN}Both servers are starting!${NC}"
echo
echo -e "  ${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "  ${BLUE}Backend:${NC}  http://localhost:3001"
echo
echo -e "${CYAN}Press Ctrl+C to stop both servers...${NC}"

wait
