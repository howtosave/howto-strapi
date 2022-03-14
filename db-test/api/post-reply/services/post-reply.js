'use strict';

/**
 * post-reply service.
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { toQueryEngineParams } = require("../../../utils");

const API_UID = 'api::post-reply.post-reply';
const _query = (fn, ...args) => strapi.entityService[fn](API_UID, ...args);
const _queryEngine = (name = API_UID) => strapi.db.query(name);

const useQueryEngine = false;

module.exports = createCoreService(API_UID, () =>  ({
  async create({ data, ...params }) {
    let res;
    if (useQueryEngine) {
      res = _queryEngine().create({ data, ...toQueryEngineParams(params, 'create') });
    } else {
      res = _query("create", { data, ...params });
    }

    if (data.parent) {
      // update parent
      res = await res;
      this.updateChildrenField(+data.parent, [res.id]);
    }
    return res;
  },

  async find({ post, filters, ...params }) {
    post && (filters ? (filters.post = post) : (filters = { post }));
    if (useQueryEngine) {
      return _queryEngine().findMany(toQueryEngineParams(params, 'findMany'));
    }
    return _query('findMany', this.getFetchParams({ ...params, filters }));
  },

  async findOne(entityId, params = {}) {
    if (useQueryEngine) {
      params.id = entityId;
      return _queryEngine().findOne(toQueryEngineParams(params, 'findOne'));
    }
    return _query("findOne", entityId, params);
  },

  async update(entityId, { data, ...params }) {
    if (useQueryEngine) {
      params.id = entityId;
      return _queryEngine().update({ data, ...toQueryEngineParams(params, 'update') });
    }
    return _query("update", entityId, { data, ...params });
  },

  async delete(entityId, params) {
    if (useQueryEngine) {
      params.id = entityId;
      return _queryEngine().delete(toQueryEngineParams(params, 'delete'));
    }
    return await _query("delete", entityId, params);
  },

  /**
   * 
   * @param {number} entityId 
   * @param {number[]} toBeAdded 
   * @param {number[]} toBeDeleted 
   * @returns 
   */
  async updateChildrenField(entityId, toBeAdded, toBeDeleted = null) {
    const res = await _query("findOne", entityId, {
      populate: "children",
    });
    if (!res) return res;
    const { children = [] } = res;
    if (toBeDeleted) {
      for (const i of toBeDeleted) {
        const idx = children.indexOf(i);
        if (idx >= 0) children.splice(idx, 1);
      }
    }
    if (toBeAdded) {
      children.splice(children.length, 0, ...toBeAdded);
    }
    return _queryEngine().update({
      where: { id: entityId },
      data: {
        children,
      },
    });
  },

}));
