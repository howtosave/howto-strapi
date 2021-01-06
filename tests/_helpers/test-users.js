'use strict';

const {
  createUser, deleteUser, getRole, updatePermissions, getAuthToken
} = require("./user-utils");

// user mock data
const mockUsersData = {
  'user1': {
    username: "_test_user1",
    email: "_test_user1@local.host",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
    roleType: "authenticated",
  },
  'user2': {
    username: "_test_user2",
    email: "_test_user2@local.host",
    provider: "local",
    password: "1234abc",
    confirmed: true,
    blocked: null,
    roleType: "authenticated",
  }
};

const mockUsers = {};

async function createTestUsers(controllerPermissions, baseUrl = null) {
  // create test user
  mockUsers['user1'] = await createUser(mockUsersData['user1'], baseUrl);
  mockUsers['user1'].jwt = mockUsers['user1'].jwt || getAuthToken(mockUsers['user1'].id);
  mockUsers['user2'] = await createUser(mockUsersData['user2'], baseUrl);
  mockUsers['user2'].jwt = mockUsers['user2'].jwt || getAuthToken(mockUsers['user2'].id);

  // update controller permission
  if (controllerPermissions) {
    if (!baseUrl) {
      const publicRole = await getRole('public');
      const authenticatedRole = await getRole('authenticated');
      await updatePermissions(publicRole.id, controllerPermissions['public']);
      await updatePermissions(authenticatedRole.id, controllerPermissions['authenticated']);
    } else {
      console.warn("*** createTestUsers(): not available for remote server");
    }
  }

  return {
    mockUsers,
    mockUsersData,
  };
}

async function deleteTestUsers(baseUrl = null) {
  if (mockUsers['user1'] && mockUsers['user1'].id) {
    await deleteUser(mockUsers['user1'].id, baseUrl, mockUsers['user1'].jwt);
    mockUsers['user1'] = {};
  }
  if (mockUsers['user2'] && mockUsers['user2'].id) {
    await deleteUser(mockUsers['user2'].id, baseUrl, mockUsers['user1'].jwt);
    mockUsers['user2'] = {};
  }
}

async function getTestUsers(controllerPermissions, baseUrl = null) {
  await deleteTestUsers(baseUrl);
  return createTestUsers(controllerPermissions, baseUrl);
}

module.exports = {
  getTestUsers,
  createTestUsers,
  deleteTestUsers,
};
