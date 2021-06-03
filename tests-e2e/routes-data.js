//
// routes-data.js
//

const noop = {
  routes: require("../api/noop/config/routes").routes,
};

const users_permissions = {
  routes: require("../extensions/users-permissions/config/routes").routes,
  test_data: {
    "GET /": {
      permission_public: "skip",
      permission_authenticated: "skip",
    },
    "GET /custom-route": {
      permission_public: "skip",
      permission_authenticated: "skip",
    },
    "POST /auth/local": {
      permission_public: "skip",
    },
    "GET /auth/:provider/callback": {
      permission_public: "skip",
    },
    "PUT /users/:id": {
      permission_authenticated: {
        status: 200,
      },
      params: "{ id: '${user.id}' }",
    },
    "GET /users/me": {
      permission_authenticated: 200,
    },
    "DELETE /users/:id": {
      permission_public: 403,
      permission_authenticated: "skip",
    },
  },
};

//
// routes to be tested
//
module.exports = {
  users_permissions,
  noop,
};
