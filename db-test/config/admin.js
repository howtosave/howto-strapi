module.exports = ({ env }) => ({
  autoOpen: false,
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'admin-secret'),
  },
  watchIgnoreFiles: [
    "./build/**",
    "**/tests-*/**",
    "**/tests/**",
    "**/__tests__/**",
    "**/docs/*",
    "**/tools/*",
  ],
});
