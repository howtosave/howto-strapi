/**
 * Global Teardown
 */

const {
  circularSafeReplacer,
  circularSafeReplacerReset,
} = require("./_helpers/test-utils");

const { stopStrapi } = require("./_helpers/strapi");

const printGlobal = false;

module.exports = async function() {
  if (printGlobal) {
    console.log("***************** global-teardown.js", JSON.stringify(this.global, circularSafeReplacer, 2));
    circularSafeReplacerReset();
  } else {
    //console.log("***************** global-teardown.js", Object.keys(this.global));
    console.log("***************** global-teardown.js: isStrapi:", this.global.strapi !== null);
    if (this.global.strapi) {
      stopStrapi();
    }
  }
};
