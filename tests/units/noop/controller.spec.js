const request = require("supertest");
const { getTestUsers, deleteTestUsers } = require("../../_helpers/test-users");

const controllerPermissions = {
  public: {},
  authenticated: {
    noop: {
      // controller
      find: {
        enabled: true,
      },
      findOne: {
        enabled: true,
      },
      count: {
        enabled: true,
      },
      create: {
        enabled: true,
      },
      update: {
        enabled: true,
      },
      delete: {
        enabled: true,
      },
    },
  },
};

const mockItemsData = [
  {
    key: `key-001`,
    keyslug: `key_001`,
    name: {
      value: `name-001`,
    },
    value: [
      {
        __component: "noop.numvalue",
        value: 1,
      },
    ],
    secure: `password-001`,
    file: null,
    text: `text 001`,
    rechtext: `richtext 001`,
    email: `email-001@local.host`,
    integer: 0,
    biginteger: 0,
    float: 0.0,
    decimal: 0,
    date: "2020-01-01",
    time: "13:00:00",
    datetime: "2020-01-01T13:00:00.000Z",
    boolean: false,
    enumeration: "a",
    json: { name: "my name" },
    uid: `A-Za-z0-9-_.~`,
  },
];

async function insertTestData() {
  //console.log(Object.keys(strapi.services));
  const res = [];
  // add items in sequence
  for (const item of mockItemsData) {
    res.push(await strapi.services["noop"].create(item));
  }
  return res;
}

const _get_noop_items = async (id) =>
  id ? await strapi.services["noop"].findOne({ id }) : await strapi.services["noop"].find({});

describe("# Noop", () => {
  const { head, get, post, put, delete: delreq } = request(strapi.server);
  let mockItems;
  let mockUsers;

  beforeAll(async (done) => {
    const res = await getTestUsers(controllerPermissions);
    mockUsers = res.mockUsers;
    // insert data
    mockItems = await insertTestData();
    done();
  });

  afterAll(async (done) => {
    await deleteTestUsers();
    done();
  });

  it.skip("Should return 200 for HEAD request", async (done) => {
    await head("/noop/model")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect(200);
    await head("/noop/model/count")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect(200);
    await head(`/noop/model/${mockItems[0].id}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect(200);
    done();
  });

  it("Should return valid response for GET /noop/model/count", async (done) => {
    await get("/noop/model/count")
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body).toBe(mockItemsData.length);
      });
    done();
  });

  it("Should return valid response for GET /noop/model/count?{searchQuery}", async (done) => {
    await get(`/noop/model/count?key_eq=${mockItemsData[0].key}`)
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body).toBe(1);
      });
    done();
  });

  it("Should return valid response for GET /noop/model", async (done) => {
    await get("/noop/model")
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.length > 0 && res.body.length === mockItems.length).toBeTruthy();
      });
    done();
  });

  it("Should return valid response for GET /noop/model?{searchQuery}", async (done) => {
    await get(`/noop/model?key_eq=${mockItemsData[0].key}`)
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.length == 1).toBeTruthy();
      });
    done();
  });

  it("Should return valid response for GET /noop/model/:id", async (done) => {
    const item = mockItems[0];
    await get(`/noop/model/${item.id}`)
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect("Content-Type", /json/)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.key).toBe(item.key);
      });
    done();
  });

  it("Should return valid response for POST /noop/model", async (done) => {
    const item = {
      ...mockItemsData[0],
      key: mockItemsData[0].key + "_new", // <== has unique props
      keyslug: mockItemsData[0].keyslug + "_new", // <== slug must be unique
      uid: mockItemsData[0].uid + "_aaa", // <== uid must be unique
    };

    await post("/noop/model")
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .send(item)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.key).toStrictEqual(item.key);
      });

    done();
  });

  it("Should return valid response for PUT /noop/model/:id", async (done) => {
    const items = await _get_noop_items();
    const updateInput = {
      name: {
        value: `${items[0].name.value}_updated`,
      },
    };

    await put(`/noop/model/${items[0].id}`)
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .send(updateInput)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.name.value).toBe(updateInput.name.value);
      });

    done();
  });

  it("Should return valid response for DELETE /noop/model/:id", async (done) => {
    const items = await _get_noop_items();

    await delreq(`/noop/model/${items[0].id}`)
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.key).toBe(items[0].key);
      });

    done();
  });

  /**
   * *NOTICE* The test below will fail.
   * For reference only.
   * See how to access each field.
   */
  it.skip("Should have valid fields", async (done) => {
    const item = mockItems[0];
    await get(`/noop/model/${item.id}`)
      .set("accept", "application/json")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect("Content-Type", /json/)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);

        console.log("RES:", res.body);
        console.log("name(component)", typeof item.name, item.name);
        console.log("value(dynamiczone)", typeof item.value, item.value);
        console.log("biginteger", typeof item.biginteger, item.biginteger);
        console.log("datetime", typeof item.datetime, item.datetime);
        console.log("json", typeof item.json, item.json);

        expect(res.body.key).toBe(item.key);
        expect(res.body.keyslug).toBe(item.keyslug);
        expect(res.body.name.value).toBe(item.name.value);
        expect(res.body.value[0].value).toStrictEqual(item.value[0].value);
        expect(res.body.secure).toBe(undefined); // <== private field
        expect(res.body.file).toStrictEqual(item.file);
        expect(res.body.text).toBe(item.text);
        expect(res.body.richtext).toBe(item.richtext);
        expect(res.body.email).toBe(item.email);
        expect(res.body.integer).toBe(item.integer);
        //TODO
        //expect(res.body.biginteger).toBe(_mockData.biginteger);
        expect(res.body.float).toBe(item.float);
        expect(res.body.decimal).toBe(item.decimal);
        expect(res.body.date).toBe(item.date);
        expect(res.body.time).toBe(item.time);
        expect(new Date(res.body.datetime).toISOString()).toBe(item.datetime.toISOString());
        expect(res.body.boolean).toBe(item.boolean);
        expect(res.body.enumeration).toBe(item.enumeration);
        expect(res.body.json.name).toStrictEqual(item.json.name);
        expect(res.body.uid).toBe(item.uid);
      });
    done();
  });
});
