"use strict";

/**
 * bulletin-board.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const { ObjectId } = require("mongoose").Types;

const { isObjectId } = require("my-api-utils");

const _cores = (name = "bboard", plugin = "bulletin-boards") => ({
  query: strapi.query(name, plugin), // Util functions for database query
  model: strapi.query(name, plugin).model, // To access the underlying ORM model.
  service: strapi.plugins[plugin].services[name], // Service functions
});

const isValidBId = (id) => isObjectId(id);

module.exports = {
  async find(ctx) {
    const { query: queryParams } = ctx;
    const { pid } = ctx.params;
    // ctx.params.bid is valid from REST request
    // ctx.query.bid is valid from GraphQL request
    const bid = ctx.params.bid ? ctx.params.bid : queryParams.bid;
    if (bid) {
      if (!isValidBId(bid)) return ctx.badRequest(`Invalid bid`);
      queryParams.bid = bid;
    }

    if (pid) {
      if (!isObjectId(pid)) {
        return ctx.badRequest(`Invalid pid`);
      }
      const pEntity = await _cores().query.findOne({ id: pid, bid });
      if (!pEntity) {
        return ctx.badRequest("no article");
      }
      if (!pEntity.replies || !pEntity.replies.length) {
        return ctx.send([]);
      }
      queryParams.id_in = [];
      pEntity.replies.forEach((e) => queryParams.id_in.push(e.id));
    }
    //console.log(">>>>>>>>>>> query:", query);

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
    // ctx.params.bid is valid from REST request
    // ctx.params._bid is valid from GraphQL request
    const bid = ctx.params.bid || ctx.params._bid;

    console.log("query params:", ctx.query);
    console.log("path params:", ctx.params);

    if (!isValidBId(bid)) return ctx.badRequest(`Invalid bid`);

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
      // {"statusCode":400,"error":"Bad Request","message":"Invalid id:..."}
    }

    const entity = await _cores().query.findOne({ id, bid });
    if (!entity) {
      return ctx.badRequest(`Not found: ${id}`);
    }
    return ctx.send(entity);
  },

  async count(ctx) {
    const { query: queryParams } = ctx;
    const { bid, pid } = ctx.params;

    if (!isValidBId(bid)) return ctx.badRequest(`Invalid bid`);
    queryParams.bid = bid;

    if (pid) {
      if (!isObjectId(pid)) {
        return ctx.badRequest(`Invalid pid`);
      }
      const pEntity = await _cores().query.findOne({ id: pid });
      if (!pEntity) {
        return ctx.badRequest("no article");
      }
      if (!pEntity.replies || !pEntity.replies.length) {
        return ctx.send([]);
      }
      queryParams.id_in = [];
      pEntity.replies.forEach((e) => queryParams.id_in.push(e.id));
    } else {
      queryParams.type = "article";
    }

    if (queryParams._q) {
      return _cores().query.countSearch(queryParams);
    }
    return _cores().query.count(queryParams);
  },

  async create(ctx) {
    const { bid, pid } = ctx.params;
    const { title, content } = ctx.request.body;
    const { user } = ctx.state;

    if (!isValidBId(bid)) return ctx.badRequest(`Invalid bid`);
    if (pid && !isObjectId(pid)) return ctx.badRequest(`Invalid pid`);
    
    const boardInfo = await _cores("board").query.findOne({ id: bid });
    if (!boardInfo) return ctx.badRequest("Not found bid");
    const { allowReply = boardInfo.allowReply } = ctx.request.body;

    let type;
    let pEntity;
    if (pid) {
      if (!boardInfo.allowReply) {
        return ctx.badRequest(`Not allowed`);
      }
      pEntity = await _cores().query.findOne({ id: pid });
      if (!pEntity) {
        return ctx.badRequest(`Not found pid`);
      }
      if (!pEntity.allowReply) {
        return ctx.badRequest(`Not allowed article`);
      }
      type = "reply";
    } else {
      type = "article";
    }

    const entity = await _cores().query.create({
      bid, title, content, user, allowReply, type,
    });

    if (pid) {
      // update article's replies
      // should be await if not, it won't be updated...
      const res = await _cores().model.updateOne(
        { _id: pid },
        { "$push": { "replies": ObjectId(entity.id) } }
      );
      console.log(">>>>>>>> isUpdated:", res.nModified === 1);
    }
    return ctx.send(entity);
  },

  async update(ctx) {
    const { bid, id } = ctx.params;
    const { title, content } = ctx.request.body;

    if (!isValidBId(bid)) return ctx.badRequest(`Invalid bid`);

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
    }

    let entity = await _cores().query.update({ id, bid }, { title, content });
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
    const { bid, id } = ctx.params;

    if (!isValidBId(bid)) return ctx.badRequest(`Invalid bid`);

    // !!! Need to check id format caused 'CastError'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
    }
    let entity = await _cores().query.delete({ id, bid });
    if (!entity) {
      return ctx.badRequest(`Not found: ${id}`);
    }
    return ctx.send(entity);
  },
};
