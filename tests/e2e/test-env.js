//
// load .env
//
process.env.NODE_ENV = process.env.NODE_ENV || "development";
require("dotenv").config({
  path: require("fs").existsSync(`.env.${process.env.NODE_ENV}.local`)
    ? `.env.${process.env.NODE_ENV}.local`
    : require("fs").existsSync(`.env.${process.env.NODE_ENV}`)
    ? `.env.${process.env.NODE_ENV}` : '.env',
});

const NodeEnvironment = require("jest-environment-node");
const request = require("supertest");
const { setupStrapi } = require("../_helpers/strapi");

//
// log-in info by server
//
const targetServerConfigs = {
  internal: {
    serverUrl: `http://${process.env.HOST}:${process.env.PORT}${process.env.URL_PREFIX}`,
  },
  local: {
    serverUrl: `http://127.0.0.1:1337/nitroapi`,
  },
  dev: {
    serverUrl: `http://192.168.0.99:8080/nitroapi`,
  },
};

class StrapiEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();

    const serverName = process.env.TARGET_SERVER;
    if (!serverName || !targetServerConfigs[serverName]) {
      console.error("Invalid TARGET_SERVER:", serverName);
      throw new Error("!!! Invalid TARGET_SERVER:" + serverName);
    }

    const serverConfig = targetServerConfigs[serverName];
    if (serverName === 'internal') {
      this.global.strapi = await setupStrapi(true);
    }

    try {
      const headRes = await request(serverConfig.serverUrl).head("/");
      if (headRes.status !== 200) {
        throw new Error("!!! Server response is not 200. " + headRes.status + " from " + serverConfig.serverUrl);
      }
    } catch (e) {
      console.error("!!! Error while connecting server. error message: ", e.message);
      throw e;
    }

    this.global.serverConfig = serverConfig;
  }

  async teardown() {
    /*    
    // try to remove test data
    for (const [name, items] of Object.entries(this.global.TEST_DATA)) {
      for (const item of items) {
        await request(`${this.global.serverConfig.serverUrl}`)
        .delete(`${item.__path__}/${item.id}`)
        .set('Authorization', `Bearer ${testDataJwt}`)
        .then((res) => {
          if (res.status !== 200) {
            console.error("!!! Error while Deleting test data:", JSON.stringify(res.body));
          }
        });
      }
    }
*/
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = StrapiEnvironment;
