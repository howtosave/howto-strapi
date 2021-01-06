'use strict';

/**
 * Lifecycle callbacks for the `Like` model.
 */

module.exports = {
  lifecycles: {
    beforeCreate(...args) {
      // console.log('beforeCreate', ...args);
    },
    beforeUpdate(...args) {
      // console.log('beforeUpdate', ...args);
    },
    beforeDelete(...args) {
      // console.log('beforeDelete', ...args);
    },
    beforeFind(...args) {
      // console.log('beforeFind', ...args);
    },
    beforeFindOne(...args) {
      // console.log('beforeFindOne', ...args);
    },
    beforeCount(...args) {
      // console.log('beforeCount', ...args);
    },
    beforeSearch(...args) {
      // console.log('beforeSearch', ...args);
    },
    beforeCountSearch(...args) {
      // console.log('beforeCountSearch', ...args);
    },
  },    
};
