
const users_permissions = {
  routes: require("../extensions/users-permissions/config/routes").routes,
  test_data: {
    "POST /auth/local": {
      permission_public: "skip",
    },
    "GET /auth/:provider/callback": {
      permission_public: "skip",
    },
    "POST /auth/local-code": {
      permission_public: {
        status: 200,
        send: "{ code: '${user.jwtCode}', devid: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' }",
      },
    },
    "POST /auth/local-fb": {},
    "GET /auth/login-as-guest": {
      permission_public: 200,
    },
    "GET /users/:id/check-nickname": {
      permission_authenticated: {
        status: 200,
      },
      params: "{ id: '${user.id}' }",
      query: "name=hihi",
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
  //address,
};
