module.exports = ({env}) => ({
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
    cors: {
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'Cache-Control'],
    },
    logger: {
      level: env("STRAPI_LOG_LEVEL", "debug"),
      // request log
      requests:
        env("STRAPI_LOG_LEVEL") === "debug" ||
        env("STRAPI_LOG_LEVEL") === "trace",
    },
  },
});
