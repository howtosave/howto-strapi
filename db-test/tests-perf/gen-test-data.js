const http = require("http");
const fs = require('fs');
const { join: pathJoin } = require('path');

const host = 'localhost';
const port = 1337;
const basePath = '/api';
const outputDir = pathJoin(__dirname, 'input-data');

const email = 'test001@local.host';
const password = 'test000';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function genPost(id) {
  return {
    data: {
      title: `post ${id} -- ${Date.now()}`,
      content: `${id} generated content`,
    }
  };
}

function genReply(post) {
  return (id) => ({
    data: {
      content: `reply ${id} for ${post.title}`,
    },
  });
}

function genReplyReply(r) {
  return (id) => ({
    data: {
      content: `reply-reply ${id} for ${r.id}`,
    },
  });
}

function jsonToCsv(arr, auth) {
  const row = arr.map((e) => Object.values(e).concat([auth]).join(","));
  return row.join("\n") + "\n"; // append last LF
}

async function do_login(identifier, password) {
  return new Promise((resolve, reject) => {
    const options = {
      host,
      port,
      path: `${basePath}/auth/local`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const req = http.request(options, (res) => {
      const body = [];
      res.on('data', (chunk) => {
        body.push(chunk);
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body.join('')));
        } else {
          reject({ statusCode: res.statusCode, statusMessage: res.statusMessage });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.write(JSON.stringify({ identifier, password }));
    req.end();
  });  
}

const do_post_data = async ({ path, count, auth, getData, fileName, }) => {
  let num = 1;
  const promises = Array.from({ length: count }).map(async () => {
    await sleep(10);
    return new Promise((resolve, reject) => {
      const options = {
        host,
        port,
        path: `${basePath}${path}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ... (auth ? { Authorization: `Bearer ${auth}` } : {}),
        },
      };
      console.log(">>> request url path:", `${basePath}${path}`);

      const req = http.request(options, (res) => {
        const body = [];
        res.on('data', (chunk) => {
          body.push(chunk);
        });
  
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(body.join('')));
          } else {
            reject({ statusCode: res.statusCode, statusMessage: res.statusMessage });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(JSON.stringify(getData(num++)));
      req.end();
    });
  });
  try {
    const result = await Promise.all(promises);
    return result;
  } catch (e) {
    console.log("!!!!! ERR", e);
    return null;
  }
};

(async () => {
  // login
  let login;
  try {
    console.log(">>> Trying to login...");
    login = await do_login(email, password);
  } catch (e) {
    console.error(e);
    return 1;
  }
  console.log(">>> DONE -- login");
  // gen post data
  console.log(">>> Trying to insert post-data...");
  const auth = login.jwt;
  const posts = await do_post_data({
    auth,
    path: '/posts',
    count: 10,
    getData: genPost,
  });
  // save to file
  fs.writeFile(pathJoin(outputDir, 'posts.csv'), jsonToCsv(posts, auth), (err) => {
    if (err) console.error(err);
  });
  console.log(">>> DONE -- posts");
  if (posts) {
    console.log(">>> Trying to insert reply-data");
    // gen reply data by each post
    const promises = posts.map((e) => {
      return do_post_data({
        path: `/posts/${e.id}/post-replies`,
        count: 5,
        getData: genReply(e),
      });
    });
    const replies = await Promise.all(promises);
    let trunc = true;
    const fileName = `post-replies.csv`;
    for (const json of replies) {
      if (trunc) {
        trunc = false;
        fs.writeFileSync(pathJoin(outputDir, fileName), jsonToCsv(json, auth));
      } else { // append
        fs.appendFileSync(pathJoin(outputDir, fileName), jsonToCsv(json, auth));
      }
    }
    console.log(">>> DONE -- post-replies");

    console.log(">>> Trying to insert reply-reply-data");
    // gen reply-reply data
    for (const rep of replies) {
      const prm2 = rep.map((e) => {
        return do_post_data({
          path: `/posts/${e.post}/post-replies/${e.id}`,
          count: 3,
          getData: genReplyReply(e),
        });
      });
      const reprep = await Promise.all(prm2);
      for (const json of reprep) {
        fs.appendFileSync(pathJoin(outputDir, fileName), jsonToCsv(json, auth));
      }
    }
    console.log(">>> DONE -- post-reply-replies");
  }
})();