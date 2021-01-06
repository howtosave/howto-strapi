/**
 * See https://strapi.io/documentation/v3.x/concepts/hooks.html#configuration-and-activation
 */
module.exports = ({ env }) => ({
  timeout: 3000,
  load: {
    before: [],
    order: [],
    after: [],
  },
  settings: {
    kue: {
    },
  },
});
