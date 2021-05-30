/**
 * test env
 */

const NodeEnvironment = require("jest-environment-node");
const request = require("supertest");

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

//
// server info
//
const targetServerConfigs = {
  local: {
    serverUrl: `http://${process.env.HOST}:${process.env.PORT}${process.env.URL_PREFIX}`,
  },
  dev: {
    serverUrl: `https://dev.server.com${process.env.URL_PREFIX}`,
  },
};

class TestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();

    const serverName = process.env.TARGET_SERVER;
    if (!serverName || !targetServerConfigs[serverName]) {
      throw new Error("!!! Invalid TARGET_SERVER:" + serverName);
    }

    const serverConfig = targetServerConfigs[serverName];

    try {
      const headRes = await request(serverConfig.serverUrl).head("/");
      if (headRes.status !== 200) {
        throw new Error("!!! Server response is not 200. " + headRes.status + " from " + serverConfig.serverUrl);
      }
    } catch (e) {
      throw e;
    }

    this.global.serverConfig = serverConfig;
  }
}

module.exports = TestEnvironment;
