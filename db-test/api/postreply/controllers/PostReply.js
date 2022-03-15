'use strict';

const {
  sanitizeEntity, // removes all private fields from the model and its relations
} = require("strapi-utils");

/**
 * post-reply controller
 */

const _service = (name = "postreply") => (strapi.services[name]);
const sanitizeOutput = (entity, name = "postreply") => sanitizeEntity(entity, {
  model: strapi.models[name],
});

module.exports = {
  async create(ctx) {
    return await _service().create({ 
      ...ctx.query,
      data: { 
        ...ctx.request.body.data, post: ctx.params.post, parent: ctx.params.parent 
      }, 
    });
  },

  async find(ctx) {
    let res;
    if (ctx.query._q) {
      res = await _service().search({ ...ctx.query, post: ctx.params.post });
    } else {
      res = await _service().find({ ...ctx.query, post: ctx.params.post });
    }
    return res;
  },

  async findOne(ctx) {
    return await _service().findOne(ctx.params.id, ctx.query);
  },

  async update(ctx) {
    return await _service().update(ctx.params.id, {
      ...ctx.query,
      data: ctx.request.body.data 
    });
  },

  async delete(ctx) {
    return await _service().delete(ctx.params.id, ctx.query);
  }
};
