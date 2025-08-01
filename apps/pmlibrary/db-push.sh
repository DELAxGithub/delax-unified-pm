#!/bin/bash

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if password is set
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "Error: SUPABASE_DB_PASSWORD not found in .env.local"
    exit 1
fi

# Check if access token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "Error: SUPABASE_ACCESS_TOKEN not found in .env.local"
    exit 1
fi

echo "Pushing database migrations to remote Supabase..."

# Use expect to automatically provide password
expect -c "
spawn ./supabase-cli db push --linked
expect \"Enter your database password:\"
send \"$SUPABASE_DB_PASSWORD\r\"
expect eof
"

echo "Database push completed!"