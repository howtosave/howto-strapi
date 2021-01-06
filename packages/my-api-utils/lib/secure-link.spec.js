const SecureLink = require("./secure-link");

test("Secure link hash", () => {
  let res = SecureLink.generateSecurePathHash(
    "/nitropm/joyfitness-gym/RELEASES"
  );
  expect(res).toBeDefined();

  res = SecureLink.generateSecurePathHash(
    "/nitropm/joyfitness-gym/RELEASES",
    new Date("2099-12-31").getTime()
  );
  expect(res).toBeDefined();
});

test("Secure link url", () => {
  const baseUrl = "/nitropm/joyfitness-gym/RELEASES";
  let res = SecureLink.generateSecureLink(baseUrl);
  expect(res).toBeDefined();
  expect(res.startsWith(baseUrl)).toBe(true);

  res = SecureLink.generateSecureLink(
    baseUrl,
    new Date("2021-01-05T04:05:00Z").getTime()
  );
  expect(res).toBeDefined();
  expect(res.startsWith(baseUrl)).toBe(true);
  console.log(res);
});
