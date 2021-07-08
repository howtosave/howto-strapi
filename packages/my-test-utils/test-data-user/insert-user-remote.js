const fs = require("fs");
const util = require("util");
const request = require("request");
const { initServerUrl } = require("../utils/helper");

// set target server
const { serverUrl, host } = initServerUrl();

// 생성할 user count
const NUM_USERS_TOBE_GEN = 10;

const { genUsers } = require("./gen-users");
// enable request debug
//request.debug = true;
const _post = util.promisify(request.post);

// register users
function register(users) {
  users.forEach((ele) => {
    _post(`${serverUrl}/auth/local/register`, { form: ele })
      .then((res) => console.log("registry user: ", ele.username, res.statusCode))
      .catch((err) => console.error(err));
  });
}

// login
function login(users, outputDir, overwrite = false) {
  !fs.existsSync(outputDir) && fs.mkdirSync(outputDir);

  users.forEach((ele) => {
    const jsonFile = `${outputDir}/${ele.username}.json`;

    // do not login if the json file exists
    if (!overwrite && fs.existsSync(jsonFile)) return;

    fs.existsSync(jsonFile) && fs.unlinkSync(jsonFile);
    // do login
    _post(`${serverUrl}/auth/local`, { form: { identifier: ele.email, password: ele.password } })
      .then((res) => {
        console.log("login : ", ele.username, res.statusCode);
        res.statusCode === 200 && fs.writeFileSync(`${outputDir}/${ele.username}.json`, res.body);
      })
      .catch((err) => console.error(err));
  });
}

const users = genUsers(NUM_USERS_TOBE_GEN);
const outputDir = `${__dirname}/../output/test-users-${host}`;

if (!process.argv[2] || process.argv[2] === "login") {
  console.log("Try to login to", serverUrl);
  login(users, true);
} else if (process.argv[2] === "register") {
  console.log("Try to register user to ", serverUrl);
  register(users);
} else {
  console.log("Invalid argument ", process.argv[2]);
}
