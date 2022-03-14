const request = require("supertest");

function send_request(baseUrl, path, query) {
  return request(baseUrl)
    .get(`${path}?${query}`)
    .expect(200);
}

(async (baseUrl, path) => {
  const query = "kue=noop&racing=1&id=";
  const reqs = [];
  let count = 100;
  for (let i = 0; i < count; i++) {
    reqs.push(send_request(baseUrl, path, query + i));
  }

  const ress = await Promise.all(reqs);
  for (const res of ress) {
    console.log(count--, res.body);
  }
})("http://localhost:1337", "/carboapi/kue/add");
