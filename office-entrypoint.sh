#!/usr/bin/env bash
set -euo pipefail

# Passwords without special characters to avoid bash escaping issues
DB_PASSWORD=${DB_PASSWORD:-solaria2024}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-SolariaRoot2024}
DB_NAME=${DB_NAME:-solaria_construction}
DB_USER=${DB_USER:-solaria_user}
PORT=${PORT:-3030}

# Validate required environment variables
: "${DB_PASSWORD:?DB_PASSWORD is required}"
: "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required}"

# Ensure perms
chown -R mysql:mysql /var/lib/mysql /var/run/mysqld

# Initialize MariaDB if missing
if [ ! -d /var/lib/mysql/mysql ]; then
  echo "[office] Initializing MariaDB data directory"
  mariadb-install-db --user=mysql --datadir=/var/lib/mysql >/dev/null
fi

# Start MariaDB in background
echo "[office] Starting mariadbd"
mariadbd --user=mysql --bind-address=0.0.0.0 --innodb-use-native-aio=0 &
MYSQL_PID=$!

# Wait for MariaDB with timeout
echo "[office] Waiting for MariaDB to be ready..."
for i in {1..30}; do
  if mariadb-admin ping --silent 2>/dev/null; then break; fi
  sleep 1
done

# Setup database - handle fresh install (no root password) vs existing install
if mariadb -uroot -e "SELECT 1" 2>/dev/null; then
  echo "[office] Fresh install detected - configuring database..."
  mariadb -uroot <<EOSQL
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${MYSQL_ROOT_PASSWORD}');
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOSQL
  echo "[office] Database configured successfully"
else
  echo "[office] Existing install detected - verifying database..."
  # Ensure database and user exist for existing installs
  mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
  mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}'; GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%'; FLUSH PRIVILEGES;" 2>/dev/null || true
fi

# Run init SQL (idempotent)
mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" ${DB_NAME} < /docker-entrypoint-initdb.d/01-init.sql 2>/dev/null || true

# Normalize dashboard passwords (SHA256 of 'bypass')
mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" ${DB_NAME} -e "UPDATE users SET password_hash='f271a122bf4230c7c217b4cb8a66f8b4325b9c1821627dca16924fff32d6aa71';" 2>/dev/null || true

# Verify setup
USER_COUNT=$(mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" ${DB_NAME} -sN -e "SELECT COUNT(*) FROM users" 2>/dev/null || echo 0)
echo "[office] Users in database: ${USER_COUNT}"

# Export env for dashboard
export DB_HOST=127.0.0.1
export DB_USER=${DB_USER}
export DB_PASSWORD=${DB_PASSWORD}
export DB_NAME=${DB_NAME}
export PORT=${PORT}

# Start dashboard
cd /app
node server.js &
NODE_PID=$!

echo "[office] Dashboard running on port ${PORT}"

trap 'echo "[office] stopping"; kill ${NODE_PID} ${MYSQL_PID}; wait' SIGTERM SIGINT
wait
