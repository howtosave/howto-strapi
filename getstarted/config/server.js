const adminWatchIgnoreFiles = [
  "./build/**",
  "**/tests/**",
  "**/tests-e2e/**",
  "**/docs/*",
  "**/tools/*",
];

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // server url
  // See https://strapi.io/documentation/developer-docs/latest/development/plugins/users-permissions.html#providers
  url: env("SERVER_URL", "https://api.server.com"),
  admin: {
    url: env("SERVER_URL", "https://api.server.com") + "/adminconsole",
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'example-token'),
      watchIgnoreFiles: adminWatchIgnoreFiles,
    },
  },
});
