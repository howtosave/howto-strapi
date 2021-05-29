const sqlite = {
  connector: 'bookshelf',
  settings: {
    client: 'sqlite',
    filename: '.tmp/data.db',
  },
  options: {
    // debug: true,
    useNullAsDefault: true,
  },
};

const postgres = {
  connector: 'bookshelf',
  settings: {
    client: 'postgres',
    database: 'strapi',
    username: 'strapi',
    password: 'strapi',
    port: 5432,
    host: 'localhost',
  },
  options: {},
};

const mysql = {
  connector: 'bookshelf',
  settings: {
    client: 'mysql',
    database: 'strapi',
    username: 'strapi',
    password: 'strapi',
    port: 3306,
    host: 'localhost',
  },
  options: {},
};

const mongo = {
  connector: 'mongoose',
  settings: {
    database: process.env.DB_NAME || 'strapi-dev',
    username: process.env.DB_USER || 'strapi',
    password: process.env.DB_PASS || 'strapi',
    port: process.env.DB_PORT || 27017,
    host: process.env.DB_HOST || 'localhost',
  },
  options: {},
};

const db = {
  mysql,
  sqlite,
  postgres,
  mongo,
};

module.exports = {
  defaultConnection: 'default',
  connections: {
    default: process.env.DB ? db[process.env.DB] || db.sqlite : db.sqlite,
  },
};
