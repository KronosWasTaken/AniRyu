#!/bin/sh
mkdir -p /app/data
echo "Starting backend..."
/app/backend-api &
echo "Starting Nginx..."
nginx -g "daemon off;"
