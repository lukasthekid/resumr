#!/bin/sh
set -e

echo "Starting application..."

# Run database migrations
echo "Running database migrations..."
if node_modules/.bin/prisma migrate deploy; then
  echo "Migrations completed successfully"
else
  echo "Warning: Migrations failed or were skipped"
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
