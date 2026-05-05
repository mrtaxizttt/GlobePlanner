FROM php:8.2-apache

RUN apt-get update && apt-get install -y libpq-dev libcurl4-openssl-dev \
    && docker-php-ext-install pdo pdo_pgsql curl \
    && rm -rf /var/lib/apt/lists/*

RUN echo "DirectoryIndex index.html index.php" > /etc/apache2/conf-enabled/directory-index.conf

COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
