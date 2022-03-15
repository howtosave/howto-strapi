'use strict';

/**
 * post-reply router.
 */

 module.exports = {
  routes: [
    {
      method: "GET",
      path: "/posts/:post/post-replies",
      handler: "PostReply.find",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/posts/:post/post-replies/:id",
      handler: "PostReply.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/posts/:post/post-replies",
      handler: "PostReply.create",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/posts/:post/post-replies/:id",
      handler: "PostReply.update",
      config: {
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/posts/:post/post-replies/:id",
      handler: "PostReply.delete",
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/posts/:post/post-replies/:parent?',
      handler: 'PostReply.create',
      config: {
        policies: [],
      },
    },
  ],
};
