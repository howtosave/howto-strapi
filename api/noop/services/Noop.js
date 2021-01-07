'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

/**
 * + query
 *     - database query를 위한 utility function
 *     - API Reference: https://strapi.io/documentation/v3.x/concepts/queries.html#api-reference
 * + model
 *     - ORM model(Mongoose, Bookshelf or etc)에 대한 query를 수행할 수 있다.
 *     - Mongoose documentation: https://mongoosejs.com/docs/guide.html
 *
 * @param {*} name
 */
const _cores = (name = "noop") => ({
  query: strapi.query(name), // Util functions for database query
  model: strapi.query(name).model, // To access the underlying ORM model.
});
const _modelName = 'noop';

module.exports = {
  /**
   * Promise to fetch all records
   *
   * @return {Promise}
   */
  find(params, populate) {
    //return strapi.entityService.find({ params, populate }, { model: _modelName });
    return strapi.query(_modelName).find(params, populate);
  },

  /**
   * Promise to fetch record
   *
   * @return {Promise}
   */

  findOne(params, populate) {
    //return strapi.entityService.findOne({ params, populate }, { model: modelName });
    return strapi.query(_modelName).findOne(params, populate);
  },

  /**
   * Promise to count record
   *
   * @return {Promise}
   */

  count(params) {
    //return strapi.entityService.count({ params }, { model: _modelName });
    return strapi.query(_modelName).count(params);
  },

  /**
   * Promise to add record
   *
   * @return {Promise}
   */

  async create(data, { files } = {}) {
    //return strapi.entityService.create({ data, files }, { model: modelName });

    const validData = await strapi.entityValidator.validateEntity(strapi.models[_modelName], data);
    const entry = await strapi.query(_modelName).create(validData);
    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: _modelName,
        // if you are using a plugin's model you will have to add the `source` key (source: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },

  /**
   * Promise to edit record
   *
   * @return {Promise}
   */

  async update(params, data, { files } = {}) {
    //return strapi.entityService.update({ params, data, files }, { model: _modelName });
    const validData = await strapi.entityValidator.validateEntityUpdate(
      strapi.models[_modelName],
      data
    );
    const entry = await strapi.query(_modelName).update(params, validData);

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: _modelName,
        // if you are using a plugin's model you will have to add the `source` key (source: 'users-permissions')
      });
      return this.findOne({ id: entry.id });
    }

    return entry;
  },

  /**
   * Promise to delete a record
   *
   * @return {Promise}
   */

  delete(params) {
    //return strapi.entityService.delete({ params }, { model: _modelName });
    return strapi.query(_modelName).delete(params);
  },

  /**
   * Promise to search records
   *
   * @return {Promise}
   */

  search(params) {
    //return strapi.entityService.search({ params }, { model: _modelName });
    return strapi.query(_modelName).search(params);
  },

  /**
   * Promise to count searched records
   *
   * @return {Promise}
   */
  countSearch(params) {
    //return strapi.entityService.countSearch({ params }, { model: _modelName });
    return strapi.query(_modelName).countSearch(params);
  },
};
