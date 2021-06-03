module.exports = {
  routes: [
    {
      method: "GET",
      path: "/noop",
      handler: "Noop.index",
      config: {
        policies: [],
      },
      __test_data__: {
        permission_public: 200,
        permission_authenticated: 200,
        expect: "expect(res.text).toBe('GET:noop')",
      },
    },
    {
      method: "POST",
      path: "/noop",
      handler: "Noop.index",
      config: {
        policies: [],
      },
      __test_data__: {
        permission_public: 400,
        permission_authenticated: {
          status: 200,
          expect: "expect(res.text).toBe('POST:noop')",
        },
      },
    },
    {
      method: "GET",
      path: "/noop/me",
      handler: "Noop.me",
      config: {
        policies: ["plugins::users-permissions.isAuthenticated"],
        "tag": {
          "actionType": "find",
        },
      },
      __test_data__: {
        permission_authenticated: {
          status: 200,
          expect: ["expect(res.body.id).toBeTruthy()", "expect(res.body.email).toBeTruthy()"],
        },
      },
    },
    {
      method: "GET",
      path: "/noop/admin",
      handler: "Noop.admin",
      config: {
        policies: ["isAdministrativeRoleUser"],
      },
      __test_data__: {},
    },
    {
      method: "GET",
      path: "/noop/model",
      handler: "Noop.find",
      config: {
        policies: [],
        "tag": {
          "actionType": "find",
        },
      },
      __test_data__: {
        permission_authenticated: 200,
      },
    },
    {
      method: "GET",
      path: "/noop/model/count",
      handler: "Noop.count",
      config: {
        policies: [],
        "tag": {
          "actionType": "count",
        },
      },
      __test_data__: {
        permission_public: 200,
        permission_authenticated: 200,
      },
    },
    {
      method: "POST",
      path: "/noop/model",
      handler: "Noop.create",
      config: {
        policies: [],
        "tag": {
          "actionType": "create",
        },
      },
      __test_data__: {
        permission_authenticated: {
          status: 200,
          send: "{ key: 'test_key_${floor(random()*10000000)}', name: { value: 'test name'} }",
          name: "MODEL_POST",
        },
      },
    },
    {
      method: "GET",
      path: "/noop/model/:id",
      handler: "Noop.findOne",
      config: {
        policies: [],
        "tag": {
          "actionType": "findOne",
        },
      },
      __test_data__: {
        permission_authenticated: {
          status: 200,
          params: "{ id: '${MODEL_POST.id}' }",
        },
      },
    },
    {
      method: "PUT",
      path: "/noop/model/:id",
      handler: "Noop.update",
      config: {
        policies: [],
        "tag": {
          "actionType": "update",
        },
      },
      __test_data__: {
        permission_authenticated: {
          status: 200,
          params: "{ id: '${MODEL_POST.id}' }",
          send: "{ name: { value: 'testname_updated'} }",
        },
      },
    },
    {
      method: "DELETE",
      path: "/noop/model/:id",
      handler: "Noop.delete",
      config: {
        policies: ["plugins::users-permissions.isAuthenticated"],
        "tag": {
          "actionType": "delete",
        },
      },
      __test_data__: {
        permission_authenticated: {
          status: 200,
          params: "{ id: '${MODEL_POST.id}' }",
          send: "{ name: { value: 'testname_updated'} }",
        },
      },
    },
  ],
};
