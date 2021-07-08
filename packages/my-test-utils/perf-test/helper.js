
function statusCallback(error, result, latency) {
  console.log("Current latency %j, result %j, error %j", latency, result, error);
  console.log("----");
  console.log(`Request elapsed: ${result.requestElapsed}ms`);
  console.log("Request index: ", result.requestIndex);
  console.log("Request loadtest() instance index: ", result.instanceIndex);
}

function printResultTable(result) {
  console.log(`| ${result.totalRequests} | ${result.totalTimeSeconds} | ${result.rps} | ${result.meanLatencyMs} | ${result.maxLatencyMs} |`);
}

function printResult(options, result) {
  console.log(`Target URL:          ${options.method} ${options.url}`);
  console.log(`Max requests:        ${options.maxRequests}`);
  console.log(`Concurrency level:   ${options.concurrency}`);
  console.log(`Requests per second: ${options.requestsPerSecond}`);
  console.log(``);
  console.log(`Completed requests:  ${result.totalRequests}`);
  console.log(`Total errors:        ${result.totalErrors}`);
  console.log(`Total time:          ${result.totalTimeSeconds} s`);
  console.log(`Requests per second: ${result.rps}`);
  console.log(`Mean latency:        ${result.meanLatencyMs} ms`);
  console.log(`Max  latency:        ${result.maxLatencyMs} ms`);
  console.log(``);
  console.log(`Percentage of the requests served within a certain time`);
  console.log(`  50%      ${result.percentiles["50"]} ms`);
  console.log(`  90%      ${result.percentiles["90"]} ms`);
  console.log(`  95%      ${result.percentiles["95"]} ms`);
  console.log(`  99%      ${result.percentiles["99"]} ms`);
  console.log(` 100%      ${result.maxLatencyMs} ms (longest request)`);
  console.log(``);
  console.log(`Error codes`, result.errorCodes);
}

module.exports = {
  statusCallback,
  printResult,
  printResultTable,
}
