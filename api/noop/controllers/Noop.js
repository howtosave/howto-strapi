"use strict";

/**
 * A set of functions called "actions" for `Noop`
 *
 *
 * See core controller implementation in
 * https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#controllers
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

const VERBOSE = false;

module.exports = {
  // #########################################################
  // Custom Controllers
  // #########################################################

   /**
   * noop
   *
   * @return '{GET|POST}noop'
   */
  async index(ctx) {
    if (VERBOSE) {
      strapi.log.debug("Request method:", ctx.request.method);
      strapi.log.debug("Request header:", ctx.request.header);
      strapi.log.debug("Request query:", ctx.request.query);
      strapi.log.debug("Request user:", ctx.state.user);
    }
    if (ctx.request.method === "POST" && !ctx.state.user) {
      return ctx.badRequest("no user");
    }
    return ctx.send(`${ctx.request.method}:noop`);
  },
  /**
   * noop/me
   *
   * @return {
   *   id: string, email: string, username: string, provider: string
   * }
   */
  async me(ctx) {
    if (VERBOSE) {
      strapi.log.debug("Request header:", ctx.request.header);
      strapi.log.debug("Request user: ", ctx.state.user);
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
    if (VERBOSE) {
      strapi.log.debug("/noop/admin");
      strapi.log.debug("Request header:", ctx.request.header);
      strapi.log.debug("Request Query:", ctx.request.query);
      strapi.log.debug("Request user:", ctx.state.user);
    }
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

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id: ${id}`);
      // {"statusCode":400,"error":"Bad Request","message":"Invalid id:..."}
    }

    const entity = await strapi.services.noop.findOne({ id });
    if (!entity) {
      return ctx.badRequest({
        id: "Noop.err.notFound",
        message: `Not found: ${id}`,
      });
      // { "statusCode":400,"error":"Bad Request","message":"Not found",
      //   "data":{"id": "err.notFound", "message": "Not found: ..."} }
    }
    return sanitizeEntity(entity, { model: strapi.models.noop });
  },

  async count(ctx) {
    if (ctx.query._q) {
      return strapi.services.noop.countSearch(ctx.query);
    }
    return strapi.services.noop.count(ctx.query);
  },

  async create(ctx) {
    // !!! Need to try-catch
    try {
      let entity;
      if (ctx.is("multipart")) {
        const { data, files } = parseMultipartData(ctx);
        entity = await strapi.services.noop.create(data, { files });
      } else {
        entity = await strapi.services.noop.create(ctx.request.body);
      }
      return sanitizeEntity(entity, { model: strapi.models.noop });
    } catch (e) {
      console.error(">>>>>>>>>>>>>>", e.name);
      console.error(JSON.stringify(e));
      const isForce = true;
      if (e.name === "MongoError") {
        ctx.badRequest(formatMongoError({ id: "Noop.err.db" }, e, isForce));
        // id: "Noop.error.db.{err_code}"
      } else {
        ctx.badRequest(formatNormalError({ id: "Noop.err.invalidRequest" }, e, isForce));
        // id: "Noop.error.invalidRequest"
      }
    }
  },

  async update(ctx) {
    const { id } = ctx.params;

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest({
        id: "Noop.err.invalidRequest",
        message: `Invalid id: ${id}`,
      });
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

    if (!entity) {
      // N.B.
      // This block never be called.
      // Because strapi sends 404 error in the 'update' function if no entry found
      //
      return ctx.badRequest({
        id: "Noop.err.notFound",
        message: `Invalid id: ${id}`,
      });
    }
    return sanitizeEntity(entity, { model: strapi.models.noop });
  },

  async delete(ctx) {
    const { id } = ctx.params;

    // !!! Need to check id format caused 'CastError'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest({
        id: "Noop.err.invalid",
        message: `Invalid id: ${id}`,
      });
    }

    return strapi.services.noop.delete({ id });
  },
};
