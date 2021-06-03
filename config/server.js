
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
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'example-token'),
      watchIgnoreFiles: adminWatchIgnoreFiles,
    },
  },
});
