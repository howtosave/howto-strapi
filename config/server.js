"use strict";
/**
 * server.js
 *
 * # access
 * strapi.config.get('server.host', defaultHost);
 *
 * # documentation
 * https://strapi.io/documentation/v3.x/concepts/configurations.html#server
 */

/**
 * ignore files for watching on DEV mode
 */
const adminWatchIgnoreFiles = ["./build/**", "**/tests/**", "**/__tests__/**"];

module.exports = ({ env }) => ({
  host: env("HOST", "127.0.0.1"),
  port: env.int("PORT", 1337),
  url: env("PROXY_URL", ""),
  admin: {
    url: `/adminconsole`,
    serveAdminPanel: env.bool("ENABLE_STRAPI_ADMIN_PANEL", true),
    watchIgnoreFiles: adminWatchIgnoreFiles,
    autoOpen: false,
    auth: {
      secret: env("ADMIN_JWT_SECRET", "f0f0f0f0-dc5d-3ee1-a421-43c3a7125a10"), // Secret used to encode JWT tokens
    },
  },
  cron: {
    enabled: false,
  },
});
