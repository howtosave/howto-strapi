//
// routes-data.js
//

const noop = {
  routes: require("../api/noop/config/routes").routes,
};

const users_permissions = {
  routes: require("../extensions/users-permissions/config/routes").routes,
  test_data: {
    "GET /": { // TODO: set prefix with the plugin name, 'users-permissions'
      permission_public: "skip",
      permission_authenticated: "skip",
      permission_administrative: "skip",
    },
    "GET /users/custom-route": {
      permission_public: 403,
      permission_authenticated: 403,
      permission_administrative: 403,
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
        send: "{ username: 'new_name_${floor(random()*10000000)}' }",
      },
      permission_administrative: {
        status: 200,
        send: "{ username: 'new_name_${floor(random()*10000000)}' }",
      },
      params: "{ id: '${user.id}' }",
    },
    "GET /users/me": {
      permission_authenticated: 200,
      permission_administrative: 200,
    },
    "DELETE /users/:id": {
      permission_public: 403,
      permission_authenticated: "skip",
      permission_administrative: "skip",
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
