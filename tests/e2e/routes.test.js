const request = require("supertest");
const _ = require("lodash");
const { compile } = require("path-to-regexp");
const userhelper = require("../_helpers/test-users");

//
// http request functions
const { head, get, post, put, delete: delreq } = request(global.serverConfig.serverUrl);

const _method = (verb) =>
  verb.toLowerCase() === "head"
    ? head
    : verb.toLowerCase() === "get"
    ? get
    : verb.toLowerCase() === "post"
    ? post
    : verb.toLowerCase() === "put"
    ? put
    : verb.toLowerCase() === "delete"
    ? delreq
    : null;

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
const targetRoutes = require("./target-routes");

const availableRoles = {
  public: {
    headers: {},
  },

  authenticated: {
    headers: {},
  },
};

const testContext = {
  testUsers: {},
  resData: {},
};

beforeAll(async () => {
  const res = await userhelper.createTestUsers(
    null,
    global.serverConfig.serverUrl
  );
  testContext.testUsers = res.mockUsers;
  testContext.testUsersData = res.mockUsersData;
  availableRoles["authenticated"].headers[
    "Authorization"
  ] = `Bearer ${testContext.testUsers["user1"].jwt}`;
});

afterAll(async () => {
  await userhelper.deleteTestUsers(global.serverConfig.serverUrl);
});

for (const [routeName, routeObject] of Object.entries(targetRoutes)) {
  describe(`# ${routeName}:`, () => {
    for (const [ridx, [roleName, roleData]] of Object.entries(Object.entries(availableRoles))) {
      const { routes } = routeObject;

      //
      // 테스트 할 routes를 name prop이 있는 항목을 우선(위)으로 정렬한다.
      // name prop은 내림차순(a to z)로 정렬한다.
      // name prop이 있는 항목이 처리한 결과는 testContext에 저장되고
      // 이 후 진행되는 항목들은 이 testContext를 참조한다.
      //
      routes.sort((a, b) => _route_sort(a, b));

      describe(`## Permissions for ${roleName} role`, () => {
        const requestContext = {};
        for (const route of routes) {
          const { handler } = route;
          let { method } = route;
          let { test_data } = routeObject;
          if (test_data) test_data = test_data[`${method}_${route.path}`];
          if (!test_data) test_data = route.__test_data__;

          const permission = (test_data && test_data[`permission_${roleName}`]) || 403;
          const permissionStatus =
            Number.isInteger(permission) || permission === "skip" ? permission : permission.status;
          it(`### ${handler}: ${method} ${route.path} should be ${permissionStatus}`, async () => {
            // skip permission check
            if (permission === "skip") return;

            // set test user. you shoud set the user HERE!
            requestContext.user = testContext.testUsers["user1"];
            // test_data에서 permission 정보를 가져온다.
            // 해당 role에 대한 permission 정보가 없으면 default는 403(Forbidden)이다.
            let path;
            let send = "",
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
              send = permission[`send`] || test_data[`send`] || "";
              send = send && _.template(send)(extendedData);
              send = send && eval(`(${send})`);
              name = permission[`name`] || test_data[`name`] || "";
              const query = permission[`query`] || test_data[`query`] || "";
              if (query) path += `?${query}`;
            }

            let res;
            switch (method) {
              case "POST":
              case "PUT":
                res = await _method(method)(`${path}`)
                  .send(send)
                  .set(roleData.headers);
                break;
              default:
                res = await _method(method)(`${path}`).set(roleData.headers);
                break;
            }
            if (res.status !== permissionStatus) {
              console.log(
                `>>> FAILURE: ${handler} > ${roleName} > ${method} ${path}: ${permissionStatus} !== ${res.status}`
              );
              console.log(`   RES.BODY: ${JSON.stringify(res.body)}`);
            }
            expect(res.status).toBe(permissionStatus);

            // save result
            if (name) {
              requestContext[name] = res.body;
              //console.log("DATA SAVED", resData);
            }
          });
        }
      }); // EO permission tests
    } // EO role loop
  }); // EO e2e tests
} // EO e2e tests loop

/*
const _getAuthValue = (roleType) => (
  (serverConfig.users[roleType] && serverConfig.users[roleType].jwt) ?
    `Bearer ${serverConfig.users[roleType].jwt}` : ''
);

const _getUser = (roleType) => (
  (serverConfig.users[roleType] && serverConfig.users[roleType].user) ?
    serverConfig.users[roleType].user : {}
);

for (const [routeName, routeObject] of Object.entries(targetRoutes)) {
  const { routes } = routeObject;
  describe(`# ${routeName} e2e tests:`, () => {
    //
    // 테스트 할 routes를 name prop이 있는 항목을 우선(위)으로 정렬한다.
    // name prop은 내림차순(a to z)로 정렬한다.
    // name prop이 있는 항목이 처리한 결과는 resData에 저장되고
    // 이 후 진행되는 항목들은 이 resData를 참조한다.
    // 
    routes.sort((a,b) => _route_sort(a,b));

    //
    // 앞서 진행한 resData를 유지하기 위해 각 role 별로 routes에 대한 테스트를 진행한다.
    // sequential test를 위해 한 개의 test() 함수에서 처리한다.
    //
    describe.sip("## Test User Permissions by each role", () => {
      for (const [ridx, role] of availableRoles.entries()) {

        it(`### ${role.type}`, async (done) => {
          let resData = { TEST_DATA };

          for (const route of routes) {
            // permissions 데이터가 없는 항목들은 무시한다.
            if (!route.__test_data__ || !route.__test_data__.permissions) continue;

            const permission = route.__test_data__.permissions[ridx];
            const authValue = _getAuthValue(role.type);
            let result = null;

            const extendedData = _.extend({ random: Math.random }, resData);
            const toPath = compile(route.path, { encode: encodeURIComponent });
            const paramsTmpl = route.__test_data__[`params_${permission}`] || route.__test_data__.params;
            const params = paramsTmpl ? _.template(paramsTmpl)(extendedData) : '';
            const path = params ? toPath(eval(`(${params})`)) : route.path;

            function checkResStatus(res) {
              if (res.status !== permission) {
                console.error(`>>> FAILURE: ${routeName} > ${role.type} > ${route.method} ${path}: ${permission} !== ${res.status}\n    RES.BODY: ${JSON.stringify(res.body)}`);
              }
            }
            function saveResBody(res) {
              if (res.status === 200) 
                result = res.body;
            }

            if (route.method === 'GET') {
              await get(`${path}`)
                .set('Authorization', authValue)
                .then((res) => {
                  checkResStatus(res);
                  expect(res.status).toBe(permission);
                  saveResBody(res);
                });
            }
            else if (route.method === 'POST') {
              const send = route.__test_data__.send ? _.template(route.__test_data__.send)(extendedData) : ''
              await post(`${path}`)
                .set('Authorization', authValue)
                .send(send ? eval(`(${send})`) : {})
                .then((res) => {
                  checkResStatus(res);
                  expect(res.status).toBe(permission);
                  saveResBody(res);
                });
            }
            else if (route.method === 'PUT') {
              const send = route.__test_data__.send ? _.template(route.__test_data__.send)(extendedData) : ''
              await put(`${path}`)
                .set('Authorization', authValue)
                .send(send ? eval(`(${send})`) : {})
                .then((res) => {
                  checkResStatus(res);
                  expect(res.status).toBe(permission);
                  saveResBody(res);
                });
            }
            else if (route.method === 'DELETE') {
              await delreq(`${path}`)
                .set('Authorization', authValue)
                .then((res) => {
                  checkResStatus(res);
                  expect(res.status).toBe(permission);
                  saveResBody(res);
                });
            }

            // save result
            if (route.__test_data__.name && result) {
              resData[route.__test_data__.name] = result;
              //console.log("DATA SAVED", resData);
            }
          }
          done();
        });
      }
    }); // eo second level describe();

    describe.skip("## Test Response Body by each role", () => {
      for (const [ridx, role] of availableRoles.entries()) {

        it(`### ${role.type}`, async (done) => {
          const user = _getUser(role.type);
          let resData = { 
            TEST_DATA, 
            user
          };

          for (const route of routes) {
            // permissions 데이터가 없는 항목들은 무시한다.
            if (!route.__test_data__ || !route.__test_data__.permissions) continue;

            const permission = route.__test_data__.permissions[ridx];
            const authValue = _getAuthValue(role.type);
            let result = null;

            const extendedData = _.extend({ random: Math.random }, resData);
            const toPath = compile(route.path, { encode: encodeURIComponent });
            const paramsTmpl = route.__test_data__[`params_${permission}`] || route.__test_data__.params;
            const params = paramsTmpl ? _.template(paramsTmpl)(extendedData) : '';
            const path = params ? toPath(eval(`(${params})`)) : route.path;

            function checkResStatus(res) {
              if (res.status !== permission) {
                console.error(`>>> FAILURE: ${routeName} > ${role.type} > ${route.method} ${path}: ${permission} !== ${res.status}\n    RES.BODY: ${JSON.stringify(res.body)}`);
                // terminate test
                done(res.body);
              }
            }
            function saveResBody(res) {
              if (res.status === 200) 
                result = res.body;
            }

            if (route.method === 'GET') {
              await get(`${path}`)
                .set('Authorization', authValue)
                .then((res) => {
                  checkResStatus(res);
                  const expectEval = route.__test_data__[`expect_${permission}`] || route.__test_data__.expect;
                  if (expectEval) eval(_.template(expectEval)(extendedData));
                  saveResBody(res);
                });
            }
            else if (route.method === 'POST') {
              const send = route.__test_data__.send ? _.template(route.__test_data__.send)(extendedData) : ''
              await post(`${path}`)
                .set('Authorization', authValue)
                .send(send ? eval(`(${send})`) : {})
                .then((res) => {
                  checkResStatus(res);
                  const expectEval = route.__test_data__[`expect_${permission}`] || route.__test_data__.expect;
                  if (expectEval) eval(_.template(expectEval)(extendedData));
                  saveResBody(res);
                });
            }
            else if (route.method === 'PUT') {
              const send = route.__test_data__.send ? _.template(route.__test_data__.send)(extendedData) : ''
              await put(`${path}`)
                .set('Authorization', authValue)
                .send(send ? eval(`(${send})`) : {})
                .then((res) => {
                  checkResStatus(res);
                  const expectEval = route.__test_data__[`expect_${permission}`] || route.__test_data__.expect;
                  if (expectEval) eval(_.template(expectEval)(extendedData));
                  saveResBody(res);
                });
            }
            else if (route.method === 'DELETE') {
              await delreq(`${path}`)
                .set('Authorization', authValue)
                .then((res) => {
                  checkResStatus(res);
                  const expectEval = route.__test_data__[`expect_${permission}`] || route.__test_data__.expect;
                  if (expectEval) eval(_.template(expectEval)(extendedData));
                  saveResBody(res);
                });
            }

            // save result
            if (route.__test_data__.name && result) {
              resData[route.__test_data__.name] = result;
              //console.log("DATA SAVED", resData);
            }
          }
          done();
        });
      }
    }); // eo second level describe();

    //
    // test for test
    //
    test.skip("test for test", () => {
      const data = {
        "POST_RES": {
          id: "data_id"
        }
      }
      const route = {
        path: "/noop/:id",
        params: "{ id: '${POST_RES.id}' }",
        send: "{ key: 'testkey${random()}', name: { value: 'testname'} }",
      };
      extendedData = _.extend({ random: Math.random }, data);
      const params = route.params ? _.template(route.params)(extendedData) : '';
      const toPath = compile(route.path, { encode: encodeURIComponent });
      //console.log("params", params, eval(`(${params})`));
      const path = params ? toPath(eval(`(${params})`)) : route.path;

      expect(path).toBe('/noop/data_id');
      //expect(path).toBe('/noop/:id');

      const send = route.send ? _.template(route.send)(extendedData) : '';
      console.log('>>> SEND', send, eval(`(${send})`));

      /*
        expect(_strcmp('ab', 'ba')).toBe(-1);
        expect(_strcmp('ba', 'ab')).toBe(1);
        expect(_strcmp('ba', 'ba')).toBe(0);
        expect(_strcmp('a', '')).toBe(1);
        expect(_strcmp('a', null)).toBe(1);
        expect(_strcmp('a', undefined)).toBe(1);
        expect(_strcmp(null, 'a')).toBe(-1);
        expect(_strcmp(undefined, 'a')).toBe(-1);
        expect(_strcmp(null, null)).toBe(0);
        expect(_strcmp(undefined, undefined)).toBe(0);
        //expect(_strcmp(null, undefined)).toBe(0);
        //expect(_strcmp(undefined, null)).toBe(0);
      /
    });
  }); // eo top level describe()

} // eo targetRoutes
*/
