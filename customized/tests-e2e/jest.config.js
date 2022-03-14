/**
 * JEST Configuration
 * 
 * See https://jestjs.io/docs/en/configuration
 */
module.exports = {
  // 
  rootDir: "..",

  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: "<rootDir>/tests-e2e/config/global-setup.js",

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: "<rootDir>/tests-e2e/config/global-teardown.js",

  // The test environment that will be used for testing
  testEnvironment: "<rootDir>/tests-e2e/config/test-env.js",

  // favor of setupFilesAfterEnv in jest 24
  setupFilesAfterEnv: ["<rootDir>/tests-e2e/config/setup-after-env.js"],
  
  //
  verbose: true,
  
  globals: { },
}
