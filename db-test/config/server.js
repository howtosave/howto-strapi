
const adminWatchIgnoreFiles = [
  "./build/**",
  "**/tests/**",
  "**/tests-*/**",
  "**/docs/*",
  "**/tools/*",
];

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // server url
  // See https://strapi.io/documentation/developer-docs/latest/development/plugins/users-permissions.html#providers
  url: env("SERVER_URL", ""),
  admin: {
    url: env("SERVER_URL", "") + "/adminconsole",
    watchIgnoreFiles: adminWatchIgnoreFiles,
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'example-token'),
    },
  },
});
