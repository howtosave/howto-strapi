
const users_permissions = {
  routes: require("../../extensions/users-permissions/config/routes").routes,
  test_data: {
    "POST_/auth/local": {
      permission_public: "skip",
    },
    "GET_/users/custom": {
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

const noop = {
  routes: require("../../api/noop/config/routes").routes,
};

const address = {
  routes: require("../../api/address/config/routes").routes,
};

//
// routes to be tested
//
module.exports = {
  users_permissions,
  //noop,
  address,
};
