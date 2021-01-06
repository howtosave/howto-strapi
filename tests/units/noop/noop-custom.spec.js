const request = require("supertest");
const {
  createUser,
  deleteUser,
  updatePermissionsByRole,
  getAuthToken,
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

const controller_permissions = {
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
      admin: {
        // action
        enabled: false,
      },
    },
  },
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
        enabled: false,
      },
    },
    // TODO: fix issue
    /*    
    'administrative': {
      "noop": {               // controller
        "index": {            // action
          enabled: true,
        },
        "me": {               // action
          enabled: true
        },
        "admin": {               // action
          enabled: true
        }
      }
    },
    */
  },
};

describe.skip("# Noop -- Custom API", () => {
  beforeAll(async (done) => {
    // update controller permission
    await updatePermissionsByRole(controller_permissions);

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

  it("Should return expected response", async (done) => {
    await get("/noop")
      .set("accept", "application/json")
      .then((res) => {
        if (res.status != 200) console.log(">>> RES:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.text).toBe("noop"); // expect the response text
      });

    await get("/noop/me")
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["authenticated"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> RES:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(mockUsers["authenticated"].user.id);
      });
    /*
    await get('/noop/admin')
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers['administrative'].jwt}`)      
      .then(res => {
        if (res.status != 200) console.log(">>> RES:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(mockUsers['administrative'].user.id);
      });
    */
    done();
  });
});
