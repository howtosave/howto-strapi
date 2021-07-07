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

const bbidInfo = {
  "bboard": {
    allowReply: true,
  },
  "nboard": {
    allowReply: false,
  },
};
const bbids = Object.keys(bbidInfo);

const isValidBBId = (id) => bbids.indexOf(id) !== -1;

module.exports = {
  async find(ctx) {
    const { query: queryParams } = ctx;
    const { bbid, pid } = ctx.params;

    if (!isValidBBId(bbid)) return ctx.badRequest(`Invalid bbid`);

    if (pid) {
      if (!isObjectId(pid)) {
        return ctx.badRequest(`Invalid pid`);
      }
      const pEntity = await _cores(bbid).query.findOne({ id: pid });
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
      entities = await _cores(bbid).query.search(queryParams);
    } else {
      entities = await _cores(bbid).query.find(queryParams);
    }
    return ctx.send(entities);
  },

  async findOne(ctx) {
    const { bbid, id } = ctx.params;

    if (!isValidBBId(bbid)) return ctx.badRequest(`Invalid bbid`);

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id: ${id}`);
      // {"statusCode":400,"error":"Bad Request","message":"Invalid id:..."}
    }

    const entity = await _cores(bbid).query.findOne({ id });
    if (!entity) {
      return ctx.badRequest(`Not found: ${id}`);
    }
    return ctx.send(entity);
  },

  async count(ctx) {
    const { query: queryParams } = ctx;
    const { bbid, pid } = ctx.params;

    if (!isValidBBId(bbid)) return ctx.badRequest(`Invalid bbid`);

    if (pid) {
      if (!isObjectId(pid)) {
        return ctx.badRequest(`Invalid pid`);
      }
      const pEntity = await _cores(bbid).query.findOne({ id: pid });
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
      return _cores(bbid).query.countSearch(queryParams);
    }
    return _cores(bbid).query.count(queryParams);
  },

  async create(ctx) {
    const { title, content } = ctx.request.body;
    const { bbid, pid } = ctx.params;
    const { user } = ctx.state;

    if (!isValidBBId(bbid)) return ctx.badRequest(`Invalid bbid`);

    const { allowReply = bbidInfo[bbid].allowReply } = ctx.request.body;
    const createInput = {
      title,
      content,
      user,
      allowReply,
    };
    let pEntity;
    if (pid) {
      if (!isObjectId(pid)) {
        return ctx.badRequest(`Invalid pid`);
      }
      if (!bbidInfo[bbid].allowReply) {
        return ctx.badRequest(`Not allowed`);
      }
      pEntity = await _cores(bbid).query.findOne({ id: pid });
      if (!pEntity) {
        return ctx.badRequest(`Not found`);
      }
      if (!pEntity.allowReply) {
        return ctx.badRequest(`Not allowed article`);
      }
      createInput.type = "reply";
    } else {
      createInput.type = "article";
    }

    const entity = await _cores(bbid).query.create(createInput);

    if (pid) {
      // update article's replies
      // should be await if not, it won't be updated...
      const res = await _cores(bbid).model.updateOne(
        { _id: pid },
        { "$push": { "replies": ObjectId(entity.id) } }
      );
      console.log(">>>>>>>> isUpdated:", res.nModified === 1);
    }
    return ctx.send(entity);
  },

  async update(ctx) {
    const { bbid, id } = ctx.params;

    if (!isValidBBId(bbid)) return ctx.badRequest(`Invalid bbid`);

    // !!! Need to check id format
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
    }
    const { title, content } = ctx.request.body;
    let entity = await _cores(bbid).query.update({ id }, { title, content });
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
    const { bbid, id } = ctx.params;

    if (!isValidBBId(bbid)) return ctx.badRequest(`Invalid bbid`);

    // !!! Need to check id format caused 'CastError'
    if (!id || !isObjectId(id)) {
      return ctx.badRequest(`Invalid id`);
    }
    let entity = await _cores(bbid).query.delete({ id });
    if (!entity) {
      return ctx.badRequest(`Not found: ${id}`);
    }
    return ctx.send(entity);
  },
};
