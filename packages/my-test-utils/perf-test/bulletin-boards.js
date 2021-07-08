const POST_DATA = {
};

const bid = "60e6c214a6015b1aa0bbf2ac";

function getOption(method) {
  const options = {};
  if (method === "get") {
  } else if (method === "post") {
    options.body = "";
  }

  return options;
}

let _count = 0;

function _genBody() {
  const body = {
    "title": "" + _count++,
    "content": "a"
  };
  return body;
}

function _getPaging() {
  const limit = 10;
  const start = (_count++ % 10) * limit;
  return `_start=${start}&_limit=${limit}`;
}

function requestGenerator(options, url, client, callback) {
  //console.log("options:", options);

  let body;
  switch (url.method) {
    case "get": case "GET":
    url.path = `/bulletin-boards/posts/${bid}?${_getPaging()}`;
    break;
    case "post": case "POST":
      url.path = `/bulletin-boards/posts/${bid}`;
      body = JSON.stringify(_genBody());
      url.headers['Content-Type'] = 'application/json';
      url.headers['Content-Length'] = body.length;
      url.body = body;
    break;
  }
  //console.log("url:", url);

  const request = client(url, callback);
  body && request.write(body);
  return request;
}

module.exports = {
  getOption,
  requestGenerator,
}
