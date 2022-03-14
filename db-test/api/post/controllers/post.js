'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const API_UID = 'api::post.post';
const _service = (name = API_UID) => strapi.service(name);

let useDefault = false;

module.exports = createCoreController(API_UID, () => ({
  /**
   * create
   */
  async create(ctx) {
    const { data } = ctx.request.body;
    data.author = ctx.state.user.id;

    if (useDefault) {
      try {
        const { data, meta } = await super.create(ctx);
        return { data: await this.sanitizeOutput(data, ctx), meta };
      } catch (e) {
        return ctx.badRequest("post.create", e.details);
      }
    }
    const res = await _service().create({
      // params
      ...ctx.query,
      // data
      data,
    });
    return this.sanitizeOutput(res, ctx);
  },

  /**
   * read many
   */
  async find(ctx) {
    if (useDefault) {
      //FIXME: populate operation does not work.
      const res = await super.find(ctx)
      if (!res) return ctx.badRequest('post.find', { message: 'not found' });
      const { data, meta } = res;
      return { data: await this.sanitizeOutput(data, ctx), meta };
    }
    const res = await _service().find(ctx.query);
    return this.sanitizeOutput(res, ctx);
  },

  /**
   * read one
   */
  async findOne(ctx) {
    if (useDefault) {
      //FIXME: populate operation does not work.
      const res = await super.findOne(ctx)
      if (!res) return ctx.badRequest('post.findOne', { message: 'not found' });
      const { data, meta } = res;
      return { data: await this.sanitizeOutput(data, ctx), meta };
    }

    const res = await _service().findOne(ctx.params.id, ctx.query);
    return this.sanitizeOutput(res, ctx);
  },

  /**
   * update
   */
  async update(ctx) {
    if (useDefault) {
      const res = await super.update(ctx);
      if (!res) return ctx.badRequest('post.update', { message: 'not found' });
      const { data, meta } = res;
      return { data: await this.sanitizeOutput(data, ctx), meta };
    }
    const res = await _service().update(ctx.params.id, {
      // params
      ...ctx.query,
      // data
      data: ctx.request.body.data,
    });
    return this.sanitizeOutput(res, ctx);
  },

  /**
   * delete
   */
  async delete(ctx) {
    if (useDefault) {
      const res = await super.delete(ctx);
      if (!res) return ctx.badRequest('post.delete', { message: 'not found' });
      const { data, meta } = res;
      return { data: await this.sanitizeOutput(data, ctx), meta };
    }
    const res = await _service().delete(ctx.params.id, ctx.query);
    return this.sanitizeOutput(res, ctx);
  }
}));
