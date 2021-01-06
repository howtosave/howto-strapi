const request = require("supertest");
const {
  createUser,
  deleteUser,
  getAuthToken,
  updatePermissionsByRole,
} = require("../../_helpers/user-utils");

// user mock data
const mockUsersData = {
  authenticated: {
    username: "user",
    email: "user@local.host",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
    roleType: "authenticated",
  },
  administrative: {
    username: "administrative-user",
    email: "administrative@local.host",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
    roleType: "administrative",
  },
};

const mockUsers = {
  authenticated: {
    user: {},
    jwt: "",
  },
  administrative: {
    user: {},
    jwt: "",
  },
};

const administrativeRoleInput = {
  type: "administrative",
  name: "Administrative",
  description: "Admin Role",
};

describe.skip("# Noop -- Permission", () => {
  beforeAll(async (done) => {
    //await copyRole('authenticated', administrativeRoleInput);

    mockUsers["authenticated"].user = await createUser(mockUsersData["authenticated"]);
    mockUsers["authenticated"].jwt = getAuthToken(mockUsers["authenticated"].user.id);
    mockUsers["administrative"].user = await createUser(mockUsersData["administrative"]);
    mockUsers["administrative"].jwt = getAuthToken(mockUsers["administrative"].user.id);
    done();
  });

  afterAll(async (done) => {
    if (mockUsers["authenticated"].user.id) await deleteUser(mockUsers["authenticated"].user.id);
    if (mockUsers["administrative"].user.id) await deleteUser(mockUsers["administrative"].user.id);
    done();
  });

  const { get, post } = request(strapi.server);

  it("Should return 403(forbidden) for all request on initial state", async (done) => {
    // update controller permission into initial state
    await updatePermissionsByRole({
      public: {
        noop: {
          // controller
          index: { enabled: false }, // action
          me: { enabled: false },
          admin: { enabled: false },
        },
      },
      authenticated: {
        noop: {
          // controller
          index: { enabled: false }, // action
          me: { enabled: false },
          admin: { enabled: false },
        },
      },
      administrative: {
        noop: {
          // controller
          index: { enabled: false }, // action
          me: { enabled: false },
          admin: { enabled: false },
        },
      },
    });

    // access from anonymous
    await get("/noop").expect(403);
    await get("/noop/me").expect(403);
    await get("/noop/admin").expect(403);

    // access from authenticated role user
    await get("/noop")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(403);
    await get("/noop/me")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(403);
    await get("/noop/admin")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(403);

    // access from administrative role user
    await get("/noop")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(403);
    await get("/noop/me")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(403);
    await get("/noop/admin")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(403);

    done();
  });

  it.skip("Should return proper response by *PUBLIC* permission of controllers", async (done) => {
    // update public permission of controllers ({ 'index': true, 'me': true })
    // It means that auth-token 없이 접근 가능
    await updatePermissionsByRole({
      public: {
        noop: {
          // controller
          index: {
            // action
            enabled: true,
          },
          me: {
            // action
            enabled: true,
          },
        },
      },
    });

    // anony user access
    await get("/noop").expect(200);
    await get("/noop/me") // config.policies의 policy를 적용 받는다.
      .expect(401); // Unauthorized ==> admin-ui설정에서 controller 'me'의 permission을
    // 'public'로 바꿔도 route '/noop/me'는 routes.json에 설정된 policy를 적용받는다.
    await get("/noop/admin") // config.policies의 policy를 적용 받는다.
      .expect(403); // Unauthorized ==> admin-ui설정에서 controller 'admin'의 permission을
    // 'public'로 바꿔도 route '/noop/admin'는 routes.json에 설정된 policy를 적용받는다.

    // authenticated user access
    await get("/noop")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(403);
    await get("/noop/me")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(403);
    await get("/noop/me")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(403);

    // access from administrative role user
    await get("/noop")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(403);
    await get("/noop/me")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(403);
    await get("/noop/admin")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(403);

    done();
  });

  it.skip("Should return proper response by *AUTHENTICATED* permission of controllers", async (done) => {
    // update authenticated permission of controllers ({ 'index': false, 'me': true })
    // index: auth-token이 있으면 Forbidden
    // me: auth-token이 없으면 Unauthorized
    await updatePermissionsByRole({
      authenticated: {
        noop: {
          // controller
          index: {
            // action
            enabled: false,
          },
          me: {
            // action
            enabled: true,
          },
          admin: {
            // action
            enabled: true,
          },
        },
      },
    });

    // anony user access
    await get("/noop").expect(200);
    await get("/noop/me").expect(401);
    await get("/noop/admin").expect(403);

    // invalid user access (with invalid token)
    await get("/noop")
      .set("Authorization", `INVALID_TOKEN`)
      .expect(401);
    await get("/noop/me")
      .set("Authorization", `Bearer INVALID_TOKEN`)
      .expect(401);
    await get("/noop/admin")
      .set("Authorization", `Bearer INVALID_TOKEN`)
      .expect(401);

    // authenticated user access
    await get("/noop")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(403);
    await get("/noop/me")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(200);
    await get("/noop/admin")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .expect(401);

    done();
  });

  test.skip("Should return proper response by *ADMINISTRATIVE* permission of controllers", async (done) => {
    // update administrative permission of controllers
    // index: auth-token이 있으면 Forbidden
    // me: auth-token이 없으면 Unauthorized
    //console.log('>>>>> BEFORE', JSON.stringify(await getRole('administrative'), null, 2));
    await updatePermissionsByRole({
      administrative: {
        noop: {
          // controller
          index: {
            // action
            enabled: true,
          },
          me: {
            // action
            enabled: true,
          },
          admin: {
            // action
            enabled: true,
          },
        },
      },
    });

    //console.log('>>>>> ADMIN ROLE', JSON.stringify(await getRole('administrative'), null, 2));

    // anony user access
    await get("/noop").expect(200);
    await get("/noop/me").expect(401);
    await get("/noop/admin").expect(403);

    // invalid user access (with invalid token)
    await get("/noop")
      .set("Authorization", `INVALID_TOKEN`)
      .expect(401);
    await get("/noop/me")
      .set("Authorization", `Bearer INVALID_TOKEN`)
      .expect(401);
    await get("/noop/admin")
      .set("Authorization", `Bearer INVALID_TOKEN`)
      .expect(401);

    // administrative user access
    await get("/noop")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(403);
    //    await get('/noop/me').set("Authorization", `Bearer ${mockUsers['administrative'].jwt}`)
    //      .expect(200);
    await get("/noop/admin")
      .set("Authorization", `Bearer ${mockUsers["administrative"].jwt}`)
      .expect(200);

    done();
  });
});
