"use strict";
//
// See https://strapi.io/documentation/v3.x/concepts/middlewares.html#middlewares
//

module.exports = ({ env }) => ({
  settings: {
    public: {
      path: "./public",
      defaultIndex: true,
    },
    favicon: {
      path: "./public/favicon.ico",
    },
    router: {
      prefix: env("URL_PREFIX", ""),
    },
    logger: {
      level: env("STRAPI_LOG_LEVEL", "debug"),
      // disable for production
      requests: !(env("NODE_ENV") === "production"), // Enable or disable requests logs.
    },
    parser: {
      multipart: true, // Enable or disable multipart bodies parsing
      formidable: {
        // max file size for uploading
        maxFileSize: 20000000, // defaults to 200mb
      },
    },
    documentation: {
      // disable for production
      enabled: !(env("NODE_ENV") === "production"),
    },
    cron: {
      // cron does not work on multiple instances env by pm2
      enabled: false,
    },
    session: {
      // jwt only
      enabled: false,
    },
    /**
     * Security middlewares
     */
    xframe: {
      value: "SAMEORIGIN",
    },
    cors: {
      origin: "*",
    },
    // see 'koa-ip'
    ip: {
      enabled: false,
      whitelist: [],
      blacklist: [],
    },
    /**
     * RESPONSE middleware
     */
    poweredBy: {
      value: "CARBON",
    },
    responseTime: {
      // disable for production
      enabled: !(env("NODE_ENV") === "production"),
    },
    responses: {
      // custom response using ./config/functions/responses/
      enabled: false,
    },
  },
  timeout: 100,
  load: {
    before: ["responseTime", "logger", "cors", "gzip"],
    order: ["session", "xframe", "public"],
    after: ["parser", "router"],
  },
});
