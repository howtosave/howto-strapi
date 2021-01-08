"use strict";

/**
 * A set of functions called "actions" for `Noop`
 *
 *
 * See core controller implementation in
 * https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers
 *
 * # documentation
 * https://strapi.io/documentation/v3.x/concepts/controllers.html#controllers
 */

const {
  parseMultipartData, // parses Strapi's formData format.
  sanitizeEntity, // removes all private fields from the model and its relations
} = require("strapi-utils");
const { formatError, formatMongoError, formatNormalError, isObjectId } = require("my-api-utils");

/**
 * + query
 *     - database query를 위한 utility function
 *     - API Reference: https://strapi.io/documentation/v3.x/concepts/queries.html#api-reference
 * + service:
 *     - database query를 포함한 다양한 resuable function을 제공한다.
 *     - Doc: https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers
 * + model
 *     - ORM model(Mongoose, Bookshelf or etc)에 대한 query를 수행할 수 있다.
 *     - Mongoose documentation: https://mongoosejs.com/docs/guide.html
 *
 * @param {*} name
 */
const _cores = (name = "noop") => ({
  query: strapi.query(name), // Util functions for database query
  model: strapi.query(name).model, // To access the underlying ORM model.
  service: strapi.services[name], // Service functions
});

module.exports = {
  /**
   * #########################################################
   *
   * Custom Controllers
   *
   * #########################################################
   */

  /**
   * noop
   *
   * @return 'noop'
   */
  async index(ctx) {
    strapi.log.debug("/noop");
    strapi.log.debug("Request header:", ctx.request.header);
    strapi.log.debug("Request Query:", ctx.request.query);
    strapi.log.debug("Request User:", ctx.state.user);
    return ctx.send("noop");
  },
  /**
   * noop/me
   *
   * @return {
   *   id: string, email: string, username: string, provider: string
   * }
   */
  async me(ctx) {
    strapi.log.debug("********** /noop/me");
    strapi.log.debug("Request header:", ctx.request.header);
    strapi.log.debug("USER: ", ctx.state.user);
    if (!ctx.state.user) {
      return ctx.badRequest(null, { message: "no user" });
    }
    const { id, email, username, provider } = ctx.state.user;
    return ctx.send({ id, email, username, provider });
  },
  /**
   * /noop/admin
   *
   * @return 'admin'
   */
  async admin(ctx) {
    strapi.log.debug("/noop/admin");
    strapi.log.debug("Request header:", ctx.request.header);
    strapi.log.debug("Request Query:", ctx.request.query);
    strapi.log.debug("Request User:", ctx.state.user);
    return ctx.send("noop-admin");
  },

  /**
   * #########################################################
   *
   * Default Implementations
   *
   * #########################################################
   */

  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.noop.search(ctx.query);
    } else {
      entities = await strapi.services.noop.find(ctx.query);
    }

    return entities.map((entity) => sanitizeEntity(entity, { model: strapi.models.noop }));
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Noop.findOne.error.invalid",
          message: `Invalid id: ${id}`,
        })
      );
    }
    const entity = await strapi.services.noop.findOne({ id });
    return sanitizeEntity(entity, { model: strapi.models.noop });
  },

  async count(ctx) {
    if (ctx.query._q) {
      return strapi.services.noop.countSearch(ctx.query);
    }
    return strapi.services.noop.count(ctx.query);
  },

  async create(ctx) {
    let entity;
    try {
      if (ctx.is("multipart")) {
        const { data, files } = parseMultipartData(ctx);
        entity = await strapi.services.noop.create(data, { files });
      } else {
        strapi.log.debug(">>>>>>>>>>>", ctx.request.body);
        entity = await strapi.services.noop.create(ctx.request.body);
      }
      return sanitizeEntity(entity, { model: strapi.models.noop });
    } catch (e) {
      strapi.log.error(">>>>>>>>>>>>>>", e.name);
      strapi.log.error(JSON.stringify(e));
      let err;
      const isdbg = true;
      if (e.name === "MongoError") {
        err = formatMongoError({ id: "Noop.create.error.invalid" }, e, isdbg);
      } else {
        err = formatNormalError({ id: "Noop.create.error.invalid" }, e, isdbg);
      }
      return ctx.badRequest(null, err);
      /*      
      // Error: ValidationError
      // MongoError: E11000 duplicate key error collection
*/
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Noop.update.error.invalid",
          message: `Invalid id: ${id}`,
        })
      );
    }

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.noop.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.noop.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.noop });
  },

  async delete(ctx) {
    const { id } = ctx.params;
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Noop.delete.error.invalid",
          message: `Invalid id: ${id}`,
        })
      );
    }

    const entity = await strapi.services.noop.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.noop });
  },
};
