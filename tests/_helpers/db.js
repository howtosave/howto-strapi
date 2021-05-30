const mongoose = require('mongoose');
const fs = require('fs');

async function dropStrapiDB(strapi) {
  const { connections: connInfo } = strapi.config;
  await Promise.all(
    Object.keys(connInfo).map(key => {
      const conn = connInfo[key];
      if (conn.connector === 'mongoose') {
        return strapi.connections[key].connection.db.dropDatabase();
      }
      else if (conn.connector === 'bookshelf') {
        if (conn.settings.client === 'sqlite') {
          if (fs.existsSync(tmpDbFile)) {
            return fs.unlink(tmpDbFile);
          }
        }
        else {
          // TODO
          //if (conn.settings.client === 'postgres')
          console.log("*** not implemented");
        }
      }
    })
  );
  console.log(">>> dropStrapiDB(): DONE");
}

async function _mongoConnect() {
  // create db user
  require('../../tools/setup/mongodb');

  const user = process.env.DATABASE_USERNAME;
  const pass = process.env.DATABASE_PASSWORD;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;
  const dbName = process.env.DATABASE_NAME;
  const url = `mongodb://${user}:${encodeURIComponent(pass)}@${host}:${port}/`;
  const connectOptions = { user, pass, dbName, useNewUrlParser:true, useUnifiedTopology:true };

  try {
    await mongoose.connect(url,connectOptions);
  } catch (error) {
    const err = new Error(`Error connecting to the Mongo database. ${error.message}`);
    throw err;
  }
}

function dropSqlite(filename) {
  const tmpDbFile = `${__dirname}/../../${filename}`;
  if (fs.existsSync(tmpDbFile)) {
    fs.unlinkSync(tmpDbFile);
  }
}

async function dropMongo() {
  await _mongoConnect();
  await mongoose.connection.db.dropDatabase();
}

async function dropDB(silent=false) {
  const dbSettings = global['strapi'] ? strapi.config.get('database.connections.default.settings') : {};
  
  const client = dbSettings ? dbSettings.client : process.env.DB;
  const dbname = dbSettings ? dbSettings.database : process.env.DATABASE_NAME;

  if (client === "sqlite") {
    return dropSqlite(dbSettings ? dbSettings.filename : process.env.DATABASE_NAME);
  }
  else if (client === "mongo") {
    return dropMongo(dbname);
  }
  else {
    console.log("*** Invalid database client:", client);
  }
}

module.exports = {
  dropDB,
  dropStrapiDB,
};
