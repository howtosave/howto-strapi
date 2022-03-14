/* CREATE DATABASE */
CREATE DATABASE IF NOT EXISTS strapi;

/* CREATE USER */
CREATE USER 'strapi'@'localhost' IDENTIFIED BY 'strapi00';
CREATE USER 'strapi'@'%' IDENTIFIED BY 'strapi00';

/* GRANT PRIVILEGES */
GRANT ALL PRIVILEGES ON strapi.* TO 'strapi'@'localhost';
