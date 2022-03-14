'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#services)
 * to customize this service
 */

const { isDraft } = require('strapi-utils').contentTypes;

const _query = (name = "noop") => strapi.query(name);
const _model = (name = "noop") => strapi.query(name).model; // To access the underlying ORM model

module.exports = {
  /**
   * Promise to fetch all records
   *
   * @return {Promise}
   */
  find(params, populate) {
    return _query().find(params, populate);
  },

  /**
   * Promise to fetch record
   *
   * @return {Promise}
   */
  findOne(params, populate) {
    return _query().findOne(params, populate);
  },

  /**
   * Promise to count record
   *
   * @return {Promise}
   */
  count(params) {
    return _query().count(params);
  },

  /**
   * Promise to add record
   *
   * @return {Promise}
   */
  async create(data, { files } = {}) {
    const validData = await strapi.entityValidator.validateEntityCreation(
      _model(),
      data,
      { isDraft: isDraft(data, _model()) }
    );

    const entry = await _query().create(validData);

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'noop',
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
    const existingEntry = await _query().findOne(params);

    const validData = await strapi.entityValidator.validateEntityUpdate(
      _model(),
      data,
      { isDraft: isDraft(existingEntry, _model()) }
    );

    const entry = await _query().update(params, validData);

    if (files) {
      // automatically uploads the files based on the entry and the model
      await strapi.entityService.uploadFiles(entry, files, {
        model: 'noop',
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
    return _query().delete(params);
  },

  /**
   * Promise to search records
   *
   * @return {Promise}
   */
  search(params) {
    return _query().search(params);
  },

  /**
   * Promise to count searched records
   *
   * @return {Promise}
   */
  countSearch(params) {
    return _query().countSearch(params);
  },
};
