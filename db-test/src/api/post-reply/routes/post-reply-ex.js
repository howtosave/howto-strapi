'use strict';

/**
 * post-reply-ex router.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/posts/:post/post-replies/:parent?',
      handler: 'post-reply.create',
      config: {
        auth: false,
        policies: [],
      },
    },
  ]
};
