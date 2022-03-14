'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

const { credentialInfoFromEnv, initFirebaseApp } = require("my-firebase");

module.exports = () => {
  //strapi.firebase = initFirebaseApp({ credential: credentialInfoFromEnv(process.env) });
};
