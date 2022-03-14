'use strict';

const responseHandlers = require('./src/response-handlers');

module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  //'strapi::logger',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::responses',
    config: {
      handlers: responseHandlers,
    },
  },
  'strapi::favicon',
  'strapi::public',
];
