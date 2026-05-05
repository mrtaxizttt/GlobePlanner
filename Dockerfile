FROM php:8.2-apache

# Install SQLite + curl extensions (needed for university_proxy.php)
RUN apt-get update && apt-get install -y libsqlite3-dev libcurl4-openssl-dev \
    && docker-php-ext-install pdo pdo_sqlite curl \
    && rm -rf /var/lib/apt/lists/*

# Tell Apache to serve index.html as the default page
RUN echo "DirectoryIndex index.html index.php" > /etc/apache2/conf-enabled/directory-index.conf

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
