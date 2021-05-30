/**
 * Strapi Test Env
 */

const NodeEnvironment = require("jest-environment-node");
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

const { startStrapi } = require("./_helpers/strapi");
const { dropStrapiDB } = require("./_helpers/db");

const RESET_EACH = process.env.RESET_EACH === '1';

class StrapiEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    //console.log("***************** test-env$setup(): 0");
    await super.setup();
    //console.log("***************** test-env$setup(): 1");

    // create global starpi
    this.global.strapi = await startStrapi(RESET_EACH);
  }

  async teardown() {
    //console.log("***************** test-env$teardown(): 0");

    if (RESET_EACH && this.global.strapi) {
      // N.B.
      // DO NOT call stopStrapi()
      // it will be called on this.setup()
      // await stopStrapi();

      // drop db
      await dropStrapiDB(this.global.strapi);
      //await this.global.strapi.connections['default'].connection.db.dropDatabase();
      //console.log(">>>", this.global.strapi.db.connectors);
      //console.log(">>>", this.global.strapi.db.connectors.default);
      //console.log(">>>", this.global.strapi.config.connections);
      //console.log(">>>", this.global.strapi.connections);
    }
    else {
      // reuse strapi instance
    }

    await super.teardown();
    //console.log("***************** test-env$teardown(): 1");
  }
}

module.exports = StrapiEnvironment;
