
async function getRoles(type) {
  return strapi
    .query("role", "users-permissions")
    .find({type});
}

async function createUser(userInput) {
  if (userInput.role) {
    const role = await getRoles(userInput.role);
    if (!role) throw Error("Invalid role type: " + userInput.role);
    userInput.role = role.id;
  }
  try {
    // user.add() changes its password property.
    // so do not send the userInput object directly.
    // use object destructing
    const user = await strapi.plugins["users-permissions"].services.user.add({...userInput});
    //console.log('USER:', user);
    return user;
  } catch (e) {
    if (e.message.includes("Duplicate entry")) {
      // existing user
      return strapi.plugins["users-permissions"].services.user.fetch({ email: userInput.email });
    }
    throw e;
  }
}

async function deleteUser(id) {
  return strapi.plugins["users-permissions"].services.user.remove({ id });
}

async function deleteAllUser() {
  const users = await strapi.plugins["users-permissions"].services.user.find({});
  for (const user of users) {
    await deleteUser(user.id);
  }
}

function getAuthToken(id) {
  return strapi.plugins["users-permissions"].services.jwt.issue({ id });
}

module.exports = { 
  createUser,
  deleteUser,
  deleteAllUser,
  getAuthToken,
};
