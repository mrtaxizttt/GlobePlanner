FROM php:8.2-apache

# Install SQLite system libraries first, then compile the PHP extensions
RUN apt-get update && apt-get install -y libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

# Copy all project files into the Apache web root
COPY . /var/www/html/

# Give Apache write access to create and modify the SQLite DB file
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
