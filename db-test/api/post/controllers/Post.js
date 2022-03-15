'use strict';

const {
  sanitizeEntity, // removes all private fields from the model and its relations
} = require("strapi-utils");

/**
 * post controller
 */

const _cores = (name = "post") => ({
  query: strapi.query(name),
  model: strapi.query(name).model,
  service: strapi.services[name],
});

const _service = (name = "post") => (strapi.services[name]);
const sanitizeOutput = (entity, name = "post") => sanitizeEntity(entity, {
  model: strapi.models[name],
});

module.exports = {
  /**
   * create
   */
  async create(ctx) {
    const { data } = ctx.request.body;
    data.author = ctx.state.user.id;

    const res = await _service().create({
      // params
      ...ctx.query,
      // data
      data,
    });
    return sanitizeOutput(res);
  },

  /**
   * read many
   */
  async find(ctx) {
    let res;
    if (ctx.query._q) {
      res = await _service().search(ctx.query);
    } else {
      res = await _service().find(ctx.query);
    }
    return res.map(entity => sanitizeOutput(entity));
  },

  /**
   * read one
   */
  async findOne(ctx) {
    const res = await _service().findOne(ctx.params.id, ctx.query);
    return sanitizeOutput(res);
  },

  /**
   * update
   */
  async update(ctx) {
    const res = await _service().update(ctx.params.id, {
      // params
      ...ctx.query,
      // data
      data: ctx.request.body.data,
    });
    return sanitizeOutput(res);
  },

  /**
   * delete
   */
  async delete(ctx) {
    const res = await _service().delete(ctx.params.id, ctx.query);
    return sanitizeOutput(res);
  }
};
