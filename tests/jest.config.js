/**
 * JEST Configuration
 * 
 * See https://jestjs.io/docs/en/configuration
 */

module.exports = {
  rootDir: "..",
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)", 
    "**/?(*.)+(spec|test).[tj]s?(x)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/packages/",
    "/plugins/",
    "/.tmp/",
    "/tmp/",
    "/noop/",
    "/api/",
    "/.cache/",
    "/build/",
    "/strapi/",
    "/tests/e2e/",
  ],
  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: '<rootDir>/tests/global-setup.js',

  // The test environment that will be used for testing
  testEnvironment: '<rootDir>/tests/strapi-test-env.js',

  // favor of setupFilesAfterEnv in jest 24
  setupFilesAfterEnv: ['<rootDir>/tests/setup-after-env.js'],

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: '<rootDir>/tests/global-teardown.js',

  globals: {
  },
}

/**
 * Setup file invocation order
 * 
 * - global-setup
 * 
 * # start test 1 #
 * - test-env.setup()
 * - after-env
 * # done test 1 #
 * - test-env.teardown()
 * 
 * # start test 2 #
 * - test-env.setup()
 * - after-env
 * # done test 2 #
 * - test-env.teardown()
 *
 * - global-teardown
 * 
 * Logs
$ jest --config ./jest.config.js --forceExit --detectOpenHandles tests/units/user
Determining test suites to run...
***************** global-setup.js undefined

***************** test-env$setup(): 0
 PASS  tests/units/user/service.spec.js
  ● Console

    console.log
      ***************** setup-after-env.js undefined

***************** test-env$teardown(): 0

***************** test-env$setup(): 0
 PASS  tests/units/user/controller.spec.js
  ● Console

    console.log
      ***************** setup-after-env.js undefined

      at Object.<anonymous> (tests/setup-after-env.js:3:9)


Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        4.85 s
Ran all test suites matching /tests\/units\/user/i.
***************** global-teardown.js
[2021-05-30T07:58:28.051Z] debug GET /users-permissions/custom-route (32 ms) 200
***************** test-env$teardown(): 0
 */