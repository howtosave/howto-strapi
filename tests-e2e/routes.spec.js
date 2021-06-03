
const request = require("supertest");
const _ = require("lodash");
const { compile } = require("path-to-regexp");
const {
  createUserViaApi,
  deleteUserViaApi,
} = require("./user-utils");
//
// http request functions
const _req_functions = request(global.serverConfig.serverUrl);
const _method = (verb) => _req_functions[verb.toLowerCase()];

/**
 * helpers
 */
const _strcmp = (s1, s2, nul = 1) =>
  s1 === s2
    ? 0
    : s1 === null || s1 === undefined
    ? -1 * nul
    : s2 === null || s2 === undefined
    ? 1 * nul
    : s1 > s2
    ? 1
    : -1;
const _route_sort = (r1, r2) =>
  _.isNil(r1.__test_data__) && _.isNil(r2.__test_data__)
    ? 0
    : _.isNil(r1.__test_data__)
    ? -1
    : _.isNil(r2.__test_data__)
    ? 1
    : _strcmp(r1.__test_data__.name, r2.__test_data__.name, -1);

//
// routes to be tested
const targetRoutes = require("./routes-data");

const testUsersInput = {
  authenticated: {
    username: "e2e_test_001",
    password: "testuser0!0!)!)!",
    email: "__e2e_test_001__@local.host",
    role: "authenticated",
    user: {},
  },
};

const testContext = {
  testUsers: {},
  resData: {},
};

const rolesInfo = {
  public: {
    headers: {},
  },

  authenticated: {
    headers: {},
  },
};

beforeAll(async () => {
  const promises = Object.keys(testUsersInput).map(async (userRole) => (
    testContext.testUsers[userRole] = await createUserViaApi(testUsersInput[userRole], global.serverConfig.serverUrl)
  ));
  await Promise.all(promises);
  Object.keys(testContext.testUsers).forEach((userRole) => (
    rolesInfo[userRole].headers["Authorization"] = `Bearer ${testContext.testUsers[userRole].jwt}`
  ));
});

afterAll(async () => {
  const promises = Object.keys(testContext.testUsers).map((userRole) => {
    const user = testContext.testUsers[userRole];
    return deleteUserViaApi(user, user.jwt, global.serverConfig.serverUrl);
  });
  await Promise.all(promises);
});

//
// create test-cases
//
// level 1: by apis
// level 2:   by permissions
// level 3:     by routes
for (const [apiName, routeData] of Object.entries(targetRoutes)) {
  describe(`# ${apiName}:`, () => {
    for (const [ridx, [roleName, roleData]] of Object.entries(Object.entries(rolesInfo))) {
      const { routes } = routeData;
      //
      // 테스트 할 routes를 name prop이 있는 항목을 우선(위)으로 정렬한다.
      // name prop은 내림차순(a to z)로 정렬한다.
      // name prop이 있는 항목이 처리한 결과는 requestContext에 저장되고
      // 이 후 진행되는 항목들은 이 requestContext를 참조한다.
      //
      routes.sort((a, b) => _route_sort(a, b));

      describe(`## Permissions for ${roleName} role`, () => {
        const requestContext = {};
        for (const route of routes) {
          const { handler } = route;
          let { method } = route;
          let { test_data } = routeData;
          if (test_data) test_data = test_data[`${method} ${route.path}`];
          if (!test_data) test_data = route.__test_data__;

          // test_data에서 permission 정보를 가져온다.
          // 해당 role에 대한 permission 정보가 없으면 default는 403(Forbidden)이다.
          const permission = (test_data && test_data[`permission_${roleName}`]) || 403;
          const permissionStatus =
            Number.isInteger(permission) || permission === "skip" ? permission : permission.status;

          it(`### ${handler}: ${method} ${route.path} should be ${permissionStatus}`, async () => {
            // skip permission check
            if (permission === "skip") return;

            // set test user. you shoud do it HERE!
            requestContext.user = testContext.testUsers["authenticated"];
            let path,
              send = "",
              name = "";

            const extendedData = _.extend(
              { random: Math.random, floor: Math.floor },
              requestContext
            );

            if (!test_data) {
              path = route.path;
            } else {
              // override method
              method = permission[`override`] || method;

              const toPath = compile(route.path, { encode: encodeURIComponent });
              const paramsTmpl = permission[`params`] || test_data.params;
              const params = paramsTmpl ? _.template(paramsTmpl)(extendedData) : "";

              path = params ? toPath(eval(`(${params})`)) : route.path;
              const query = permission[`query`] || test_data[`query`] || "";
              if (query) path += `?${query}`;

              send = permission[`send`] || test_data[`send`] || "";
              send = send && _.template(send)(extendedData);
              send = send && eval(`(${send})`);

              name = permission[`name`] || test_data[`name`] || "";
            }

            //
            // make request
            let res;
            switch (method) {
              case "POST":
              case "PUT":
                // send data
                res = await _method(method)(`${path}`).send(send).set(roleData.headers);
                break;
              default:
                res = await _method(method)(`${path}`).set(roleData.headers);
                break;
            }

            //
            // check the response
            if (res.status !== permissionStatus) {
              console.log(
                `>>> FAILURE: ${handler} > ${roleName} > ${method} ${path}: ${permissionStatus} !== ${res.status}`
              );
              console.log(`   RES.BODY: ${JSON.stringify(res.body)}`);
            }
            expect(res.status).toBe(permissionStatus);
            const customExpect = permission[`expect`] || (test_data && test_data[`expect`]);
            if (customExpect) {
              if (Array.isArray(customExpect)) {
                customExpect.forEach((exp) => {
                  eval(_.template(exp)({ res }));
                });
              } else {
                eval(_.template(customExpect)({ res }));
              }
            }

            //
            // save result
            if (name) {
              requestContext[name] = res.body;
              //console.log("DATA SAVED", resData);
            }

            //
            // additional tests
            //

            //
            // find actionType
            let actionType = route.config && route.config.tag && route.config.tag.actionType;
            if (!actionType) {
              actionType = handler.match(/.*\.find$/)
                ? "find"
                : handler.match(/.*\.count$/)
                ? "count"
                : handler.match(/.*\.create$/)
                ? "create"
                : handler.match(/.*\.update$/)
                ? "update"
                : handler.match(/.*\.delete$/)
                ? "delete"
                : handler.match(/.*\.findOne$/)
                ? "findOne"
                : "";
            }
            //
            // check actionType and method
            if (actionType) {
              if (actionType === "find" || actionType === "fineOne" || actionType === "count") {
                expect(route.method).toBe("GET");
              } else if (actionType === "create") {
                expect(route.method).toBe("POST");
              } else if (actionType === "update") {
                expect(route.method).toBe("PUT");
              } else if (actionType === "delete") {
                expect(route.method).toBe("DELETE");
              }
            }
            //
            // check basic exception handler
            if (permissionStatus !== 403) {
              if (route.path.match(/:id$/)) {
                let path;
                switch (actionType) {
                  case "findOne":
                  case "delete":
                  case "update":
                    path = route.path.replace(/:id$/, "invalid_id");
                    res = await _method(method)(`${path}`).set(roleData.headers);
                    expect(res.status >= 300 && res.status < 500).toBe(true);
                    // valid but unavailble
                    path = route.path.replace(/:id$/, "123456789012345678901234");
                    res = await _method(method)(`${path}`).set(roleData.headers);
                    expect(res.status >= 300 && res.status < 500).toBe(true);
                    break;
                }
              }
            }
          });
        }
      }); // EO permission description
    } // EO permission loop
  }); // EO api description
} // EO api loop
