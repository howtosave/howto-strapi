'use strict';

/**
 * post-reply router.
 */
const { createCoreRouter } = require('@strapi/strapi').factories;

const API_UID = 'api::post-reply.post-reply';

module.exports = createCoreRouter(API_UID, {
  prefix: '/posts/:post',
  //only: ['find', 'findOne'],
  except: [],
  config: {
    create: {
      auth: false,
      policies: [],
    },
    find: {
      auth: false,
      policies: [],
    },
    findOne: {
      auth: false,
      policies: [],
    },
    update: {
      auth: false,
      policies: [],
    },
    delete: {
      auth: false,
      policies: [],
    },
  },
});
