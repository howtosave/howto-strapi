const request = require("supertest");

async function loginUserViaApi(userInput, baseUrl) {
  const resBody = await request(baseUrl).post(`/auth/local`)
  .send({...userInput,identifier:userInput.email})
  .then((res) => {
    if (res.status === 200) return res.body;
    console.error(`!!! LOGIN FAILURE: ${JSON.stringify(res.body)}`);
    return null;
  });
  if (!resBody) return null;
  return {
    ...resBody.user,
    jwt:resBody.jwt,
  };
}

async function createUserViaApi(userInput, baseUrl) {
  let tryToLogin = false;
  let resBody = await request(baseUrl).post(`/auth/local/register`)
  .send(userInput)
  .then((res) => {
    if (res.status === 200) return res.body;
    // existing user
    if (res.status === 400) tryToLogin = true;
    else console.error(`>>> USER REGISTRATION FAILURE: ${JSON.stringify(res.body)}`);
    return null;
  });
  if (tryToLogin) return loginUserViaApi(userInput, baseUrl);
  if (!resBody) return null;
  return {
    ...resBody.user,
    jwt:resBody.jwt,
  };
}

async function deleteUserViaApi({ id }, authToken, baseUrl) {
  const user = await request(baseUrl).delete(`/users/${id}`)
  .set('Authorization', `bearer ${authToken}`)
  .then((res) => {
    if (res.status === 200) return res.body;
    console.error(`>>> USER DELETION FAILURE: ${JSON.stringify(res.body)}`);
    return null;
  });
  return user;
}

module.exports = {
  loginUserViaApi,
  createUserViaApi,
  deleteUserViaApi,
};
