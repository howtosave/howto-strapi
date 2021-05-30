/**
 * Strapi Test Env
 */

//
// load .env
//
process.env.NODE_ENV = process.env.NODE_ENV || "development";
require("dotenv").config({
  path: require("fs").existsSync(`.env.${process.env.NODE_ENV}.local`)
    ? `.env.${process.env.NODE_ENV}.local`
    : require("fs").existsSync(`.env.${process.env.NODE_ENV}`)
    ? `.env.${process.env.NODE_ENV}` : `.env`,
});

const NodeEnvironment = require("jest-environment-node");
const { startStrapi } = require("./_helpers/strapi");

class StrapiEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    console.log("***************** test-env$setup(): 0");
    await super.setup();
    console.log("***************** test-env$setup(): 1");

    // create global starpi
    this.global.strapi = await startStrapi();
  }

  async teardown() {
    console.log("***************** test-env$teardown(): 0");
    // do not call strapiStop()
    // global.strapi is reused
    await super.teardown();
    console.log("***************** test-env$teardown(): 1");
  }
}

module.exports = StrapiEnvironment;
