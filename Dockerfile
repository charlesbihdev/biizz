# syntax=docker/dockerfile:1
# Laravel 13 + PHP 8.3 + Inertia/React (Vite). PostgreSQL driver included.

# --- Assets: Wayfinder (gitignored) must run before `npm run build`
FROM php:8.3-cli-bookworm AS assets
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip \
    libpng-dev libzip-dev zip \
    libpq-dev libsqlite3-dev \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install -j$(nproc) pdo_pgsql pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev

# Dummy key so Artisan can run during image build only
ENV APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
RUN php artisan wayfinder:generate --no-interaction

COPY package.json package-lock.json ./
RUN npm ci
RUN npm run build

# --- Runtime: Nginx + PHP-FPM + Supervisor (queue worker)
FROM php:8.3-fpm-bookworm
WORKDIR /var/www/html

# libonig-dev: mbstring (regex). libicu-dev: intl. libsqlite3-dev: pdo_sqlite.
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx supervisor \
    libzip-dev zip unzip \
    libpng-dev libfreetype6-dev libjpeg62-turbo-dev \
    libpq-dev libsqlite3-dev \
    libonig-dev libicu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql pdo_sqlite mbstring exif pcntl bcmath gd zip opcache intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/zz-opcache.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev

COPY --from=assets /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

COPY docker/nginx/default.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
