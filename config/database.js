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
    database: 'strapi-dev',//process.env.DATABASE || 'strapi',
    username: 'myroot', //process.env.DATABASE_USERNAME || 'root',
    password: 'myroot000', //process.env.DATABASE_PASSWORD || 'strapi',
    port: 27017, //process.env.DATABASE_PORT || 27017,
    host: 'localhost',
  },
  options: {},
};

const db = {
  mysql,
  sqlite,
  postgres,
  mongo,
};

module.exports = ({env}) => ({
  defaultConnection: 'default',
  connections: {
    default: env('DB') ? db[env('DB', 'sqlite')] : db.sqlite,
  },
});
