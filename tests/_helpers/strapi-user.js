
async function getRole(type) {
  return strapi
    .query("role", "users-permissions")
    .findOne({type});
}

async function createUser(userInput) {
  if (userInput.role) {
    const role = await getRole(userInput.role);
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

async function updatePermissions(role, permissionInput, type="application") {
  /*
    const permissions = {
      application: {          // type
        controllers: {
          noop: {             // controller
            index: {          // action
              enabled: true   // 
            }
          }
        }
      }
    };
  */
  const roleInst = await getRole(role);
  const permissions = {
    [type]: {
      controllers: {
        ...permissionInput
      }
    }
  };

  await strapi.plugins["users-permissions"]
  .services.userspermissions.updateRole(roleInst.id, { permissions });
  return roleInst.id;
}

module.exports = { 
  createUser,
  deleteUser,
  deleteAllUser,
  getAuthToken,
  updatePermissions,
};
