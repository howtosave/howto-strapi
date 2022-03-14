'use strict';

/**
 * post router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;
const API_UID = 'api::post.post';

module.exports = createCoreRouter(API_UID, {
  prefix: '',
  //only: ['find', 'findOne'],
  except: [],
  config: {
    create: {
    },
    find: {
      //auth: false,
      policies: [],
    },
    findOne: {
      //auth: false,
      policies: [],
    },
    update: {
      policies: [],
    },
    delete: {
      policies: [],
    },
  },
});
