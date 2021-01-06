/**
 * Global Teardown
 */

const { dropDB } = require("./_helpers/db");

module.exports = async function() {
  await dropDB();
};
