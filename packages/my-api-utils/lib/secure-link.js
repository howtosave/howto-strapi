/**
 * Secure link for NginX
 *
 * See https://www.nginx.com/blog/securing-urls-secure-link-module-nginx-plus/
 */

/**
 * Secure link secret
 * nginx config file(location.conf)에 명시된 secret와 동일해야 한다.
 */
const crypto = require("crypto");
 
const DEFAULT_SECURE_LINK_SECRET = "0sEcUrElInK0";

function generateSecurePathHash(url, client_ip, expires, secret) {
  if (!url) {
    return undefined;
  }
  if (!expires) {
    expires = Date.now() + 30; // expires in 30 seconds
  } else if (typeof expires === "number") {
    if (expires < Date.now()) expires = Date.now() + expires;
  }
  if (!secret) {
    secret = DEFAULT_SECURE_LINK_SECRET;
  }

  const input = expires + url + " " + secret;
  const binaryHash = crypto
    .createHash("md5")
    .update(input)
    .digest();
  const base64Value = new Buffer(binaryHash).toString("base64");
  return base64Value
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function generateSecureLink(url, expires, secret) {
  if (!expires) {
    expires = Date.now() + 30; // expires in 30 seconds
  } else if (typeof expires === "number") {
    if (expires < Date.now()) expires = Date.now() + expires;
  }
  const hash = generateSecurePathHash(url, null, expires, secret);
  if (!hash) return hash;
  return `${url}?c=${hash}&e=${expires}`;
}

module.exports = {
  generateSecurePathHash,
  generateSecureLink,
};

/**
 * Examples
 *
 * generateSecurePathHash(new Date('12/31/2016 23:59:00').getTime()), '/files/pricelist.html', “192.168.33.14”, "my_password");
 *
 * ==> /files/pricelist.html?md5=AUEnXC7T-Tfv9WLsWbf-mw&expires=1483228740
 */
