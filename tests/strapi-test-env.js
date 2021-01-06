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
const { setupStrapi } = require("./_helpers/strapi");

class StrapiEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    //this.testPath = context.testPath;
    //this.docblockPragmas = context.docblockPragmas;
  }

  async setup() {
    await super.setup();

    // create global starpi
    console.log(">>> setupStrapi() start.");
    this.global.strapi = await setupStrapi();
    console.log(">>> setupStrapi() done.");
  }

  async teardown() {
    // do your teardown
    //await dropDB();
    if (strapi["carbonKue"]) {
      await strapi.carbonKue.close();
    }
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = StrapiEnvironment;
