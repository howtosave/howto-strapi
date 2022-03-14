module.exports = {
  apps: [
    {
      name: 'strapi-db-test',
      script: 'server.js',
      "instances": 2,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
