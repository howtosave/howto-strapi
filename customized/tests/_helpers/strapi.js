const Strapi = require('strapi');
const http = require('http');

var instance;

async function startStrapi(forceRestart = false, startServer=false) {
  if (forceRestart || !instance) {
    forceRestart && await stopStrapi();
    console.log(">>> startStrapi(): start new instance");

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

  if (startServer) {
    instance.server.listen(
      instance.config.get('server.port'), 
      instance.config.get('server.host'), 
      err => {console.error(err);},
      () => console.log(">>> test server on port,", instance.config.get('server.port'))
    );
  }

  return instance;
}

async function stopStrapi() {
  const tmp = instance;
  if (instance) {
    instance = null;
    if (tmp["carbonKue"]) {
      await tmp["carbonKue"].close();
    }
    await tmp.server.close(() => { });
    
    console.log(">>> strapi's been destroyed");
  }
}

module.exports = { 
  startStrapi,
  stopStrapi,
};
