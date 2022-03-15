'use strict';

/**
 * post service.
 */

 const _query = (name = "post") => strapi.query(name);

module.exports = {
  /**
   * create
   */
  async create({ data, ...params }) {
    data.meta = {
      viewCount: 0,
    };

    let res;
    res = _query().create(data, params);
    return res;
  },

  /**
   * read many
   */
  async find(params) {
    const { populate, ..._params } = params;
    return _query().find(_params, populate);
  },

  /**
   * read one
   */
  async findOne(id, { populate, ...params }) {
    let res;
    res = await _query().findOne({ id, ...params }, populate);

    // update meta
    if (res) {
      this.updateViewCount(id, 1, {});
    }
    return res;
  },

  /**
   * update one
   */
  async update(id, { data, populate, ...params }) {
    return _query().update({ id, ...params }, data, populate);
  },

  async updateViewCount(id, amount, params) {
    const res = await _query().findOne({ id });
    if (!res) return res;

    return _query().update({ id }, {
      meta: {
        ...res.meta,
        viewCount: (res.meta.viewCount || 0) + amount,
      },
      params,
    });
  },

  /**
   * delete one
   */
  async delete(id, { populate, ...params }) {
    return _query().delete({ id, ...params }, populate);
  },
};
