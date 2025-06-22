#!/bin/bash
set -e
set -u

# Get the password from environment variable
KEYCLOAK_DB_PASSWORD=${KEYCLOAK_DB_PASSWORD}


function create_user_and_database() {
    local database=$1
    echo "Creating user and database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE USER $database WITH PASSWORD '$KEYCLOAK_DB_PASSWORD';
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
EOSQL

 # Grant privileges on public schema
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="$database" <<-EOSQL
        GRANT ALL ON SCHEMA public TO $database;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $database;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $database;
EOSQL
}

if [ "$POSTGRES_MULTIPLE_DATABASES" = "quiz_db,keycloak" ]; then
  create_user_and_database "keycloak"
fi
