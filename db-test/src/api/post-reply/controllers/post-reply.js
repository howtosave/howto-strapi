'use strict';

/**
 * post-reply controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const API_UID = 'api::post-reply.post-reply';
const _service = (name = API_UID) => strapi.service(name);

module.exports = createCoreController(API_UID, ({ strapi }) => ({
  async create(ctx) {
    return await _service().create({ 
      data: { 
        ...ctx.request.body.data, post: ctx.params.post, parent: ctx.params.parent 
      }, 
      ...ctx.query,
    });
  },

  async find(ctx) {
    return await _service().find({ ...ctx.query, post: ctx.params.post });
  },

  async findOne(ctx) {
    return await _service().findOne(ctx.params.id, ctx.query);
  },

  async update(ctx) {
    return await _service().update(ctx.params.id, { ...ctx.query, data: ctx.request.body.data });
  },

  async delete(ctx) {
    return await _service().delete(ctx.params.id, ctx.query);
  }
}));
