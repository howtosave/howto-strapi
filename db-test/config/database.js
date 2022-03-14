const sqlite = {
  client: 'sqlite',
  connection: {
    filename: '.tmp/data.db',
  },
  useNullAsDefault: true,
};

const postgres = {
  client: 'postgres',
  connection: {
    database: 'strapi',
    user: 'strapi',
    password: 'strapi00',
    port: 5432,
    host: 'localhost',
  },
};

const mysql = {
  client: 'mysql',
  connection: {
    database: 'strapi',
    user: 'strapi',
    password: 'strapi00',
    port: 3306,
    host: 'localhost',
  },
};

const db = {
  mysql,
  sqlite,
  postgres,
};

module.exports = ({env}) => {
  console.log(">>> Connecting database", db[process.env.DB]);
  return {
    connection: db[process.env.DB],
  };
};
