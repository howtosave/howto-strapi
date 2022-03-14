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
  },
});
