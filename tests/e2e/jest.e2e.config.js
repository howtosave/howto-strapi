/**
 * JEST Configuration
 * 
 * See https://jestjs.io/docs/en/configuration
 */
module.exports = {
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)", 
    "**/?(*.)+(spec|test).[tj]s?(x)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.tmp/",
    "/.cache/",
    "/build/",
    "/strapi/",
    "/refs/"
  ],
  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: "./tests/e2e/global-setup.js",
  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: "./tests/e2e/global-teardown.js",
  // favor of setupFilesAfterEnv in jest 24
  // The test environment that will be used for testing
  testEnvironment: "./tests/e2e/test-env.js",

  setupFilesAfterEnv: ["./tests/e2e/jest.setup.js"],
  
  globals: { },
}
