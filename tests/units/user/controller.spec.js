const request = require("supertest");
const {
  createUser,
  deleteUser,
  getDefaultRole,
  getAuthToken,
} = require("../../_helpers/user-utils");

const initialRoles = [
  {
    name: "Authenticated",
    type: "authenticated",
  },
  {
    name: "Public",
    type: "public",
  },
];

describe("# Role -- users-permissions", () => {
  it("Should have initial roles", async (done) => {
    const roleCount = await strapi.query("role", "users-permissions").count();
    expect(roleCount).toBe(initialRoles.length);

    const roles = await strapi.query("role", "users-permissions").find({});
    expect(roles.length).toBe(initialRoles.length);
    expect(roles[0].name).toBe(initialRoles[0].name);
    expect(roles[0].type).toBe(initialRoles[0].type);
    expect(roles[1].name).toBe(initialRoles[1].name);
    expect(roles[1].name).toBe(initialRoles[1].name);

    const defaultRole = await strapi.query("role", "users-permissions").findOne({}, []);
    expect(defaultRole.name).toBe(initialRoles[0].name);

    done();
  });
});

describe("# User -- users-permissions", () => {
  // user mock data
  const mockUserData = {
    username: "test001",
    email: "test001@local.host",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
  };
  let testUser;

  beforeAll(async (done) => {
    testUser = await createUser(mockUserData);
    done();
  });

  afterAll(async (done) => {
    if (testUser) await deleteUser(testUser.id);
    done();
  });

  it("should create test user", async (done) => {
    // create new user
    const user = await createUser({
      ...mockUserData,
      username: "test002",
      email: "test002@local.host",
      roleType: 'authenticated',
    });
    expect(user).toBeDefined();

    // get jwt token
    const jwt = getAuthToken(user.id);
    expect(jwt).toBeDefined();

    // delete user
    await deleteUser(user.id);
    done();
  });
});
