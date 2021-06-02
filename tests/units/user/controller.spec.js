const request = require("supertest");
const {
  createUser,
  deleteUser,
  getAuthToken,
  updatePermissions,
} = require("../../_helpers/strapi-user");

const mockUserInput = {
  username: "test001",
  email: "test001@local.host",
  provider: "local",
  password: "1234abc",
  confirmed: true,
  blocked: null,
  role: "authenticated",
};

const permissionInput = {
  "users-permissions": {
    userspermissions: { // controller
      customroute: {  // action in lower-case
        enabled: true,
      },
    },
  }
};

describe("# User Controllers", () => {
  // user mock data
  let testUser;
  let req;

  beforeAll(async () => {
    // req
    req = request(strapi.server);
    // user
    const user = await createUser(mockUserInput);
    const jwt = await getAuthToken(user.id);
    testUser = {
      user, jwt
    };
    // permissoins
    await updatePermissions("authenticated", permissionInput["users-permissions"], "users-permissions");
  });

  afterAll(async () => {
    testUser && await deleteUser(testUser.user.id);
  });

  it("GET /users-permissions/custom-route", async () => {
    const res = await req.get("/users-permissions/custom-route")
      .set("Authorization", `Bearer ${testUser.jwt}`)
    if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
    expect(res.status).toBe(200);
    expect(res.text).toBe("allRight");
  });
});
