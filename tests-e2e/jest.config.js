/**
 * JEST Configuration
 * 
 * See https://jestjs.io/docs/en/configuration
 */
module.exports = {
  rootDir: "..",
  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: "./config/global-setup.js",

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: "./config/global-teardown.js",

  // The test environment that will be used for testing
  testEnvironment: "./config/test-env.js",

  // favor of setupFilesAfterEnv in jest 24
  setupFilesAfterEnv: ["./config/setup-after-env.js"],
  
  globals: { },
}
