'use strict';

/**
 * post router.
 */

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/posts",
      handler: "Post.find",
      "config": {
        "policies": []
      }
    },
    {
      method: "GET",
      path: "/posts/:id",
      handler: "Post.findOne",
      "config": {
        "policies": []
      }
    },
    {
      method: "POST",
      path: "/posts",
      handler: "Post.create",
      "config": {
        "policies": []
      }
    },
    {
      method: "PUT",
      path: "/posts/:id",
      handler: "Post.update",
      "config": {
        "policies": []
      }
    },
    {
      method: "DELETE",
      path: "/posts/:id",
      handler: "Post.delete",
      "config": {
        "policies": []
      }
    },
  ],
};
