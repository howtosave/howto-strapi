'use strict';

/**
 * post service.
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { toQueryEngineParams } = require("../../../utils");

const API_UID = 'api::post.post';
const _query = (fn, ...args) => strapi.entityService[fn](API_UID, ...args);
const _queryEngine = (name = API_UID) => strapi.db.query(name);

const useDefault = false;
const useQueryEngine = false;

module.exports = createCoreService(API_UID, ({ strapi }) =>  ({
  /**
   * create
   * @param {*} params 
   */
  async create({ data, ...params }) {
    data.meta = {
      viewCount: 0,
    };

    let res;
    if (useDefault) {
      res = super.create({ data, ...params });
    } else if (useQueryEngine) {
      res = _queryEngine().create({ data, ...toQueryEngineParams(params, 'create') });
    } else {
      res = _query("create", { data, ...params });
    }
    return res;
  },

  /**
   * read many
   * @param {*} params 
   */
  async find(params) {
    if (useDefault) {
      const { results, pagination } = await super.find(params);
      return { results, pagination };
    }
    else if (useQueryEngine) {
      return _queryEngine().findMany(toQueryEngineParams(params, 'findMany'));
    }
    return _query('findMany', this.getFetchParams(params));
  },

  /**
   * read one
   * @param {*} entityId
   * @param {*} params 
   */
  async findOne(entityId, params = {}) {
    // TODO: use transaction
    /*
    return strapi.db.transaction(async (entityManager) => {
      params.id = entityId;
      const entity = await entityManager.findOne(toQueryEngineParams(params));
      if (entity) {
        entityManager.update({
          id: entityId,
          data: {
            viewCount: ++entity.meta.viewCount,
          },
        });
      }
      return entity;
    });
    */
    let res;
    if (useDefault) {
      res = await super.findOne(entityId, params);
    } else if (useQueryEngine) {
      params.id = entityId;
      res = await _queryEngine().findOne(toQueryEngineParams(params, 'findOne'));
    } else {
      res = await _query("findOne", entityId, params);
    }
    // update meta
    if (res) {
      this.updateViewCount(entityId, 1);
    }
    return res;
  },

  /**
   * update one
   * @param {*} entityId
   * @param {*} params 
   */
  async update(entityId, { data, ...params }) {
    if (useDefault) {
      return super.update(entityId, { data, ...params });
    }
    else if (useQueryEngine) {
      params.id = entityId;
      return _queryEngine().update({ data, ...toQueryEngineParams(params, 'update') });
    }
    return _query("update", entityId, { data, ...params });
  },

  async updateViewCount(entityId, amount) {
    const res = await _queryEngine().findOne({
      where: { id: entityId },
      select: "meta",
    });
    if (!res) return res;

    return _queryEngine().update({
      where: { id: entityId },
      data: {
        meta: {
          ...res.meta,
          viewCount: (res.meta.viewCount || 0) + amount,
        },
      },
    });
  },

  /**
   * delete one
   * @param {*} entityId
   * @param {*} params 
   */
  async delete(entityId, params = {}) {
    let res;

    if (useDefault) {
      res = await super.delete(entityId, params);
    }
    else if (useQueryEngine) {
      params.id = entityId;
      res = await _queryEngine().delete(toQueryEngineParams(params, 'delete'));
    } else {
      res = await _query("delete", entityId, params);
    }
    return res;
  },
}));
