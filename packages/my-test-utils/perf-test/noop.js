const POST_DATA = {
  "enumeration": "a",
  "boolean": true,
  "json": [{}],
  "richtext": "fdsafdsaf",
  "keyslug": "first",
  "text": "fdsafdsa",
  "time": "00:30:00.000",
  "date": "2021-06-02",
  "uid": "fdsafdsafdsa",
  "decimal": 432432423,
  "datetime": "2021-06-02T03:00:00.000Z",
  "float": 4324324,
  "email": "test001@local.host",
  "biginteger": "432432",
  "integer": 11,
  "key": "first",
  "name": { "value": "fdsafds" },
  "value": [
    {
      "__component": "noop.strvalue",
      "value": "fdsafdsa",
    },
    { "__component": "noop.numvalue", "value": 432 },
  ],
  "createdAt": "2021-06-16T12:43:44.313Z",
  "updatedAt": "2021-06-16T12:43:44.364Z",
};

function getOption(method) {
  const options = {};
  if (method === "get") {
    options.url = `/noop/model`;
  } else if (method === "post") {
    options.url = `/noop/model`;
    options.contentType = "application/json";
    options.body = POST_DATA;
  }

  return options;
}

module.exports = {
  getOption,
}
