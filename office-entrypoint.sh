#!/usr/bin/env bash
set -euo pipefail

# Defaults
DB_PASSWORD=${DB_PASSWORD:-SolariaField2024!}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-SolariaRoot2024!}
DB_NAME=${DB_NAME:-solaria_construction}
DB_USER=${DB_USER:-solaria_user}
PORT=${PORT:-3030}

# Ensure perms
chown -R mysql:mysql /var/lib/mysql /var/run/mysqld

# Initialize MariaDB if missing
if [ ! -d /var/lib/mysql/mysql ]; then
  echo "[office] Initializing MariaDB data directory"
  mariadb-install-db --user=mysql --datadir=/var/lib/mysql >/dev/null
fi

# Start MariaDB in background
echo "[office] Starting mariadbd"
mariadbd --user=mysql --bind-address=0.0.0.0 &
MYSQL_PID=$!

# Wait for MariaDB
for i in {1..30}; do
  if mariadb-admin ping --silent; then break; fi
  sleep 1
done

# Bootstrap users/db
mariadb -uroot -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}'; FLUSH PRIVILEGES;" || true
mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}'; GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%'; FLUSH PRIVILEGES;"

# Run init SQL once (idempotent)
mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" ${DB_NAME} < /docker-entrypoint-initdb.d/01-init.sql || true

# Normalize dashboard passwords (SHA256 of 'SolariaAdmin2024!')
mariadb -uroot -p"${MYSQL_ROOT_PASSWORD}" ${DB_NAME} -e "UPDATE users SET password_hash='45d8c38c069ad13f7254d83712e30f10c4608cf5bd5655dd189075769865ece8';"

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
