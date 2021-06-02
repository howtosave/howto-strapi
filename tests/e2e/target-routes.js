
const users_permissions = {
  routes: require("../../extensions/users-permissions/config/routes").routes,
  test_data: {
    "POST_/auth/local": {
      permission_public: "skip",
    },
    "GET_/custom-route": {
      permission_public: 403,
    },
    "PUT_/users/:id": {
      permission_authenticated: {
        status: 200,
      },
      params: "{ id: '${user.id}' }",
    },
    "GET_/users/me": {
      permission_authenticated: 200,
    },
  },
};

//
// routes to be tested
//
module.exports = {
  users_permissions,
  //noop,
  //address,
};
