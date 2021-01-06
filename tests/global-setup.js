/**
 * Global Setup
 */

const { dropDB } = require("./_helpers/db");

module.exports = async () => {
  await dropDB(true);
};
