/**
 * See https://strapi.io/documentation/v3.x/concepts/configurations.html#api
 */

module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ["_v", "_id", "created_at", "updated_at"],
  },
});
