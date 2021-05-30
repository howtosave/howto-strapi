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

describe("# User Services", () => {
  // user mock data
  let testUser;

  beforeAll(async () => {
    const user = await createUser(mockUserInput);
    const jwt = await getAuthToken(user.id);
    testUser = {
      user, jwt
    };
  });

  afterAll(async () => {
    testUser && await deleteUser(testUser.user.id);
  });

  it("## should create test user", async () => {
    const { user, jwt } = testUser;
    expect(user.username).toBe(mockUserInput.username);
    expect(jwt).toBeTruthy();
  });

  it("## should update permissions", async () => {
    // "type" : "users-permissions", 
    // "controller" : "userspermissions", 
    // "action" : "customroute"
    const controllerPermissions = {
      userspermissions: { // controller
        customroute: {  // action in lower-case
          enabled: true,
        },
      },
    };
    try {
      // public role
      let roleId = await updatePermissions(
        "public",
        controllerPermissions,
        "users-permissions"
      );
      let res = await strapi.query('permission', "users-permissions").findOne({
        role: roleId,
        type: "users-permissions",
        controller : "userspermissions", 
        action : "customroute"
      });
      expect(res.enabled).toBe(true);
      // authenticated role
      roleId = await updatePermissions(
        "authenticated",
        controllerPermissions,
        "users-permissions"
      );
      res = await strapi.query('permission', "users-permissions").findOne({
        role: roleId,
        type: "users-permissions",
        controller : "userspermissions", 
        action : "customroute"
      });      
      expect(res.enabled).toBe(true);
    } catch (e) {
      console.error(e);
    }
  });
});
