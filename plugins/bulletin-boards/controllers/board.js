"use strict";

/**
 * bulletin-board.js controller
 *
 * @description: A set of functions called "actions" of the `bulletin-board` plugin.
 */

 const _cores = (name = "board", plugin = "bulletin-boards") => ({
  query: strapi.query(name, plugin), // Util functions for database query
  model: strapi.query(name, plugin).model, // To access the underlying ORM model.
  service: strapi.plugins[plugin].services[name], // Service functions
});

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    let { query, model, service } = _cores();
    console.log(">> bulletin-boards:", query == null, model == null, service == null);
    //({ query, model, service } = _cores("board", "bulletin-board"));
    //console.log(">> bulletin-board", query == null, model == null, service == null);

    // Send 200 `ok`
    ctx.send({
      message: "ok",
    });
  },
};
