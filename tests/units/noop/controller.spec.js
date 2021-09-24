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
    values: [
      {
        __component: "noop.numvalue",
        value: 1,
      },
      {
        __component: "noop.numvalue",
        value: 2,
      },
    ],
    secure: `password-001`,
    file: null,
    text: `text 001`,
    richtext: `#richtext 001 \n- one line`,
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
  const resarr = [];
  // add items in sequence
  for (const item of mockItemsData) {
    let res;
    try {
      const r = Math.floor(Math.random()*10000000);
      res = await strapi.services["noop"].create({
        ...item,
        key: item.key + r,
        keyslug: item.keyslug + r,
        uid: item.uid + r,
      });
    } catch (e) {
      if (e.code === 11000) { // duplicate key error
        res = await strapi.services['noop'].findOne({key: item.key});
      } else {
        throw e;
      }
    }
    resarr.push(res);
  }
  return resarr;
}

async function deleteTestData() {
  //console.log(Object.keys(strapi.services));
  const res = [];
  // add items in sequence
  for (const item of mockItemsData) {
    res.push(await strapi.services["noop"].delete(item));
  }
  return res;
}

const _get_noop_items = async (id = null) =>
  id ? await strapi.services["noop"].findOne({ id }) : await strapi.services["noop"].find({_sort:"createdAt:ASC"});

describe("# Noop", () => {
  const { head, get, post, put, delete: delreq } = request(strapi.server);
  let mockItems;
  let mockUsers;

  beforeAll(async () => {
    const res = await getTestUsers(controllerPermissions);
    mockUsers = res.mockUsers;
    // insert data
    mockItems = await insertTestData();
  });

  afterAll(async () => {
    await deleteTestUsers();
  });

  it("Should return 200 for HEAD request", async () => {
    await head("/noop/model")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect(200);
    await head("/noop/model/count")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect(200);
    await head(`/noop/model/${mockItems[0].id}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect(200);
  });

  it("Should return valid response for GET /noop/model/count", async () => {
    await get("/noop/model/count")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body >= mockItems.length).toBeTruthy();
      });
  });

  it("Should return valid response for GET /noop/model/count?{searchQuery}", async () => {
    await get(`/noop/model/count?key_eq=${mockItems[0].key}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body).toBe(1);
      });
  });

  it("Should return valid response for GET /noop/model", async () => {
    await get("/noop/model")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.length >= mockItems.length).toBeTruthy();
      });
  });

  it("Should return valid response for GET /noop/model?{searchQuery}", async () => {
    await get(`/noop/model?key_eq=${mockItems[0].key}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
      });
  });

  it("Should return valid response for GET /noop/model/:id", async () => {
    const item = mockItems[0];
    await get(`/noop/model/${item.id}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect("Content-Type", /json/)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.key).toBe(item.key);
      });
  });

  it("Should return valid response for POST /noop/model", async () => {
    const createInput = {
      ...mockItemsData[0],
      key: mockItemsData[0].key + "_new", // <== has unique props
      keyslug: mockItemsData[0].keyslug + "_new", // <== slug must be unique
      uid: mockItemsData[0].uid + "_new", // <== uid must be unique
    };

    await post("/noop/model")
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .send(createInput)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.key).toStrictEqual(createInput.key);
      });
  });

  it("Should return valid response for PUT /noop/model/:id", async () => {
    const items = await _get_noop_items();
    const updateInput = {
      name: {
        value: `${items[0].name.value}_updated`,
      },
    };

    await put(`/noop/model/${items[0].id}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .send(updateInput)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.name.value).toBe(updateInput.name.value);
      });
  });

  it("Should return valid response for DELETE /noop/model/:id", async () => {
    const items = await _get_noop_items();

    await delreq(`/noop/model/${items[0].id}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);
        expect(res.body.key).toBe(items[0].key);
      });
  });
});

describe.skip("# Noop model", () => {
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
    await deleteTestData();
    done();
  });


  /**
   * See how to access each field.
   */
  it("Should have valid fields", async (done) => {
    const item = mockItems[0];
    await get(`/noop/model/${item.id}`)
      .set("Authorization", `Bearer ${mockUsers["user1"].jwt}`)
      .expect("Content-Type", /json/)
      .then((res) => {
        if (res.status != 200) console.log(">>> BODY:", JSON.stringify(res.body));
        expect(res.status).toBe(200);

        console.log("RES:", res.body);
        console.log("name(component)", typeof item.name, item.name);
        console.log("value(dynamiczone)", typeof item.values, item.values);
        console.log("biginteger", typeof item.biginteger, item.biginteger);
        console.log("datetime", typeof item.datetime, item.datetime);
        console.log("json", typeof item.json, item.json);

        expect(res.body.key).toBe(item.key);
        expect(res.body.keyslug).toBe(item.keyslug);
        expect(res.body.name.value).toBe(item.name.value);
        expect(res.body.values[0].value).toStrictEqual(item.values[0].value);
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

        done();
      });
  });
});
