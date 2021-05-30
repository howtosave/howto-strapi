const {
  createUser,
  deleteUser,
  getAuthToken,
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

describe("# User -- users-permissions", () => {
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
});
