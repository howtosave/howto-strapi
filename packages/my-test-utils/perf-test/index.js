const loadtest = require("loadtest");
const { statusCallback, printResult, printResultTable } = require("./helper");
const { getOption, requestGenerator } = require("./bulletin-boards");

const targetServer = process.argv[2];
const method = process.argv[3];
const maxRequests = process.argv[4] || (method === 'get' ? 10000 : 1000);

const defaultOptions = {
  maxRequests,
  concurrency: maxRequests / 100,
  requestsPerSecond: Math.min(maxRequests / 10, 100),
};

if (!targetServer || !method) {
  console.error("!!! Not enough arguments.", `targetServer:${targetServer}, method:${method}`);
  process.exit(1);
}

(() => {
  const options = {
    ...defaultOptions,
    statusCallback,
    method,
    url: targetServer,
    ...getOption(method),
    requestGenerator,
  };
  if (targetServer.startsWith("https://dev.")) options.insecure = true;

  let currentRequests = 0;
  let currentErrors = 0;
  function statusCallback(error, result, latency) {
    currentRequests++;
    if (error) {
      currentErrors++;
    }
  }

  const progressTimer = setInterval(() => {
    console.log(
      `>>> Progress Info: ${currentRequests}(${Math.floor(
        (currentRequests / options.maxRequests) * 100
      )}%), Errors: ${currentErrors}`
    );
  }, 2000);

  loadtest.loadTest(options, function (error, result) {
    clearTimeout(progressTimer);
    if (error) {
      return console.error("!!! Got an error: %s", error);
    }
    printResult(options, result);
    printResultTable(result);
  });
})();
