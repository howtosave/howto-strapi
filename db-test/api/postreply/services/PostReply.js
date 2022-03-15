'use strict';

/**
 * post-reply service.
 */
const _query = (name = "postreply") => strapi.query(name);


module.exports = {
  async create({ data, ...params }) {
    let res;
    res = _query().create(data, params);

    if (data.parent) {
      // update parent
      res = await res;
      this.updateChildrenField(data.parent, [res.id]);
    }
    return res;
  },

  async find(params) {
    const { populate, ..._params } = params;
    return _query().find(_params, populate);
  },

  async findOne(id, { populate, ...params }) {
    return _query().findOne({ id, ...params }, populate);
  },

  async update(id, { data, populate, ...params }) {
    return _query().update({ id, ...params }, data, populate);
  },

  async delete(id, { populate, ...params }) {
    return _query().delete({ id, ...params }, populate);
  },

  /**
   * 
   * @param {string} entityId 
   * @param {string[]} toBeAdded 
   * @param {string[]} toBeDeleted 
   * @returns 
   */
  async updateChildrenField(id, toBeAdded, toBeDeleted = null) {
    const res = await _query().findOne({ id });
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
    return _query().update({ id }, { children });
  },

};
