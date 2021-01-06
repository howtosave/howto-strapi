'use strict';

const request = require('supertest');

/**
 * #######################################################
 * Users
 * #######################################################
 */
async function createUserViaApi(userInput, baseUrl) {
  let tryToLogin = false;
  let resBody = await request(baseUrl).post(`/auth/local/register`)
  .send(userInput)
  .then((res) => {
    if (res.status !== 200) {
      if (res.status === 400) {
        console.log("***", res.body.message[0]);
        tryToLogin = true;
      } else {
        console.error(`>>> FAILURE: ${JSON.stringify(res.body)}`);
      }
      return null;
    }
    return res.body;
  });
  if (tryToLogin) {
    return loginUser(userInput, baseUrl);
  }
  if (!resBody) return null;
  return {
    ...resBody.user,
    jwt:resBody.jwt,
  };
}

async function loginUser(userInput, baseUrl) {
  const resBody = await request(baseUrl).post(`/auth/local`)
  .send({...userInput,identifier:userInput.email})
  .then((res) => {
    if (res.status !== 200) {
      console.error(`!!! LOGIN FAILURE: ${JSON.stringify(res.body)}`);
      return null;
    }
    return res.body;
  });
  if (!resBody) return null;
  return {
    ...resBody.user,
    jwt:resBody.jwt,
    jwtCode:resBody.jwtCode,
  };
}

async function deleteUserViaApi(userId, baseUrl, authToken) {
  const user = await request(baseUrl).post(`/users/${userId}`)
  .set('Authorization', `bearer ${authToken}`)
  .then((res) => {
    if (res.status !== 200) {
      console.error(`>>> USER DELETION FAILURE: ${JSON.stringify(res.body)}`);
      return null;
    }
    return res.body;
  });
  return user;
}

async function createUser(userInput, baseUrl = null) {
  if (baseUrl) {
    return createUserViaApi(userInput, baseUrl);
  }

  if (userInput.roleType) {
    const role = await getRole(userInput.roleType);
    userInput.role = role.id;
  }
  // user.add() changes its password property.
  // so do not send the userInput object directly.
  // use object destructing
  try {
    const user = await strapi.plugins["users-permissions"].services.user.add({...userInput});
    //console.log('USER:', user);
    return user;
  } catch (e) {
    if (e.code === 11000) {
      return strapi.plugins["users-permissions"].services.user.fetch({email:userInput.email});
    }
    throw e;
  }
}

async function deleteUser(id, baseUrl = null, authToken = null) {
  if (baseUrl) return deleteUserViaApi(id, baseUrl, authToken);
  return strapi.plugins["users-permissions"].services.user.remove({id});
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

/**
 * #######################################################
 * Roles and Permissions
 * #######################################################
 */

let _roles = null;
async function _fetchRoles() {
  _roles = await strapi
    .query("role", "users-permissions")
    .find({});
  return _roles;
}

async function getDefaultRole() {
  if (!_roles) await _fetchRoles();
  return _roles[0];
}

async function getRole(type) {
  if (!_roles) await _fetchRoles();
  for (let i = _roles.length - 1; i >= 0; i--) {
    if (_roles[i].type === type) return _roles[i];
  }
  return null;
}

async function copyRole(oldType, newRole) {
  const oldRole = await strapi
  .query("role", "users-permissions")
  .findOne({ type: oldType });

  const role = await strapi
  .query('role', 'users-permissions')
  .create(newRole);

  const allPromises = oldRole.permissions.reduce((acc, item) => {
    acc.push(
      strapi.query('permission', 'users-permissions').create({
        ..._.omit(item, ['id', '_id', 'createdAt', 'updatedAt', 'role']),
        role: role.id,
      })
    );
    return acc;
  }, []);

  return await Promise.all(allPromises);
}

async function updatePermissions(roleID, controllerPermissions) {
  // { permissions: {
  //     application: {               // type
  //       controllers: {
  //         "noop": {                // controller
  //            "index": {            // action
  //               enabled: true
  //             }
  // ...
  //

  const permissions = {
    'application': {            // type
      'controllers': {
        ...controllerPermissions
      }
    }
  };

  await strapi.plugins["users-permissions"]
    .services.userspermissions.updateRole(roleID, { permissions });
}

async function updatePermissionsByRole(controllerPermissionsByRole) {
  for (const roleType of Object.keys(controllerPermissionsByRole)) {
    const role = await getRole(roleType);
    await updatePermissions(role.id, controllerPermissionsByRole[roleType]);
  }
}

module.exports = { 
  createUser,
  deleteUser,
  deleteAllUser,
  getAuthToken,
  getDefaultRole,
  getRole,
  copyRole,
  updatePermissions,
  updatePermissionsByRole,
};

