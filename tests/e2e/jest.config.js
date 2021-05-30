/**
 * JEST Configuration
 * 
 * See https://jestjs.io/docs/en/configuration
 */
module.exports = {
  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: "./global-setup.js",

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: "./global-teardown.js",

  // The test environment that will be used for testing
  testEnvironment: "./test-env.js",

  // favor of setupFilesAfterEnv in jest 24
  setupFilesAfterEnv: ["./setup-after-env.js"],
  
  globals: { },
}
