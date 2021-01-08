"use strict";
/**
 * database.js
 *
 * # access
 * strapi.config.get('database.connections.default.connector', defaultConnector);
 *
 * # documentation
 * https://strapi.io/documentation/v3.x/concepts/configurations.html#database
 */

 const sqlite = {
  connector: 'bookshelf',
  settings: {
    client: 'sqlite',
    filename: process.env.DATABASE_NAME, //'.tmp/data.db',
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
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
  },
  options: {},
};

const mysql = {
  connector: 'bookshelf',
  settings: {
    client: 'mysql',
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
  },
  options: {},
};

const mongo = {
  connector: 'mongoose',
  settings: {
    client: 'mongodb',
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
  },
  options: {},
};

const db = {
  mysql,
  sqlite,
  postgres,
  mongo,
};

module.exports = ({ env }) => {
  if (!process.env.DB) {
    //throw new Error("!!! DB variable is not set");
  } else {
    const defaultDb = db[process.env.DB];
    defaultDb.settings = {
      ...defaultDb.settings,
      host: env("DATABASE_HOST", defaultDb.settings.host),
      port: env.int("DATABASE_PORT", defaultDb.settings.port),
      database: env("DATABASE_NAME"),
      username: env("DATABASE_USERNAME"),
      password: env("DATABASE_PASSWORD"),
    };
    console.log(">>> Database:", `${defaultDb.settings.client}: ${defaultDb.settings.host}:${defaultDb.settings.port}/${defaultDb.settings.database}`);
  }

  return {
    defaultConnection: "default",
    connections: {
      default: db[process.env.DB],
    },
  };
};
