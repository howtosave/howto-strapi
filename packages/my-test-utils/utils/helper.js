const { URL } = require("url");

function jsonToParams(json) {
  const entries = Object.entries(json);
  const params = entries.map((ele) => {
    const [key, val] = ele;
    return `${key}=${
      typeof val === "object" ? encodeURIComponent(JSON.stringify(val)) : encodeURIComponent(val)
    }`;
  });
  return params.join("&");
}

function lapTime(hrstart) {
  const hrElapsed = process.hrtime(hrstart);
  return hrElapsed[0] * 1000 + hrElapsed[1] / 1000000;
}

function initServerUrl(targetServer = null) {
  if (!targetServer) targetServer = process.env.TARGET_SERVER;
  if (!targetServer.startsWith("http")) {
    // prepend https protocol
    targetServer = "https://" + targetServer;
  }

  const url = new URL(targetServer);
  if (url.host.startsWith("dev.") && url.protocol === "https:") {
    // avoid 'self signed certificate' error
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
  }

  if (!url.pathname) {
    url.pathname = "/nitroapi";
  }

  return {
    serverUrl: url.toString(), // return url string
    host: url.host,
  };
}

module.exports = {
  jsonToParams,
  lapTime,
  initServerUrl,
};
