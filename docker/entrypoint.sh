#!/bin/sh
set -e
cd /var/www/html

if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY must be set in the environment (e.g. php artisan key:generate --show)."
    exit 1
fi

# Wait for PostgreSQL (or any configured DB) when DB_HOST is set
if [ "${DB_CONNECTION:-pgsql}" = "pgsql" ] && [ -n "${DB_HOST:-}" ]; then
    echo "Waiting for database at ${DB_HOST}..."
    i=0
    while [ "$i" -lt 60 ]; do
        if php artisan db:show >/dev/null 2>&1; then
            echo "Database is reachable."
            break
        fi
        i=$((i + 1))
        sleep 2
    done
fi

php artisan migrate --force

if [ "${APP_ENV:-production}" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache 2>/dev/null || true
    php artisan icons:cache 2>/dev/null || true
fi

php artisan storage:link 2>/dev/null || true

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
