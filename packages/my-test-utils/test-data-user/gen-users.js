const util = require("util");

// age: 9. 10 ~ 90
// gender: 3

function genUsers({ size = 27 } = {}) {
  size = parseInt(size);
  return Array.from(Array(size), (_, idx) => {
    const username = util.format(idx >= 99 ? "test%d" : idx >= 9 ? "test0%d" : "test00%d", idx + 1);
    const gender = idx % 3 === 0 ? "male" : idx % 3 === 1 ? "female" : "nochoice";
    const birthYear = new Date().getFullYear() - ((idx % 9) + 1) * 10;
    return {
      email: `${username}@local.host`,
      password: "test000",
      username,
      gender,
      birthYear,
    };
  });
}

/**
 * insert users and return the instances in DB.
 *
 * @param {*} model mongo user model to be manipulated
 * @param {*} users user data to be input
 */
async function insertUsers(model, users, opt = {}) {
  if (!users) {
    users = genUsers(opt);
  }
  const emails = users.map((e) => e.email);
  let userExisted = await model.find({
    email: { $in: emails },
  });
  const usersToBeCreated = users.filter((e) => !userExisted.find((ee) => ee.email === e.email));
  if (usersToBeCreated.length > 0) {
    const res = await model.insertMany(usersToBeCreated, {
      rawResult: false,
    });
    userExisted = userExisted.concat(res);
  }
  return userExisted;
}

module.exports = {
  genUsers,
  insertUsers,
};
