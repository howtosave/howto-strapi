"use strict";

/**
 * bulletin-board.js controller
 *
 * @description: A set of functions called "actions" of the `bulletin-board` plugin.
 */

 const { isObjectId } = require("my-api-utils");

const _cores = (name = "board", plugin = "bulletin-boards") => ({
  query: strapi.query(name, plugin), // Util functions for database query
  model: strapi.query(name, plugin).model, // To access the underlying ORM model.
  service: strapi.plugins[plugin].services[name], // Service functions
});

module.exports = {
  async find(ctx) {
    const { query: queryParams } = ctx;

    let entities;
    if (queryParams._q) {
      entities = await _cores().query.search(queryParams);
    } else {
      entities = await _cores().query.find(queryParams);
    }
    return ctx.send(entities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
    }

    const entity = await _cores().query.findOne({ id });
    if (!entity) {
      return ctx.badRequest(`Not found: ${id}`);
    }
    return ctx.send(entity);
  },

  async count(ctx) {
    const { query: queryParams } = ctx;

    if (queryParams._q) {
      return _cores().query.countSearch(queryParams);
    }
    return _cores().query.count(queryParams);
  },

  async create(ctx) {
    const { name, allowReply = true, owner, members } = ctx.request.body;
    
    const entity = await _cores().query.create({
      name, allowReply, owner, members
    });

    return ctx.send(entity);
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { name, allowReply } = ctx.request.body;

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
    }

    let entity = await _cores().query.update({ id }, { name, allowReply });
    if (!entity) {
      // N.B.
      // This block never be called.
      // Because strapi sends 404 error in the 'update' function if no entry found
      //
      return ctx.badRequest(`Not found: ${id}`);
    }
    return ctx.send(entity);
  },

  async delete(ctx) {
    const { id } = ctx.params;

    // !!! Need to check id format caused 'CastError'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
    }
    let entity = await _cores().query.delete({ id });
    if (!entity) {
      return ctx.badRequest(`Not found: ${id}`);
    }
    return ctx.send(entity);
  },
};
