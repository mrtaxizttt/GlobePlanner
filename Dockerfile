FROM php:8.2-apache

# Enable the SQLite PDO extension
RUN docker-php-ext-install pdo pdo_sqlite

# Copy all project files into the Apache web root
COPY . /var/www/html/

# Give Apache write access to create and modify the SQLite DB file
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
