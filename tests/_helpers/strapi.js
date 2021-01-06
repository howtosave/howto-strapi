const Strapi = require('strapi');
const http = require('http');

let instance;

async function setupStrapi(start=false) {
  if (!instance) {
    /** 
     * The following code is copied from start() and listen()
     * in `./strapi/packages/strapi/lib/Strapi.js`.
     **/
    await Strapi().load();
    instance = strapi; // strapi is global now

    instance.app
      .use(instance.router.routes()) // populate KOA routes
      .use(instance.router.allowedMethods()); // populate KOA methods
    instance.server = http.createServer(instance.app.callback());
  }

  if (start) {
    instance.server.listen(
        instance.config.get('server.port'), 
        instance.config.get('server.host'), 
        err => {console.error(err);},
        () => console.log(">>> test server on port,", instance.config.get('server.port'))
    );
    
  }

  return instance;
}

async function shutdownStrapi() {
  await instance.server.close(() => {
    process.exit();
  });
}

module.exports = { 
  setupStrapi,
  shutdownStrapi,
};
