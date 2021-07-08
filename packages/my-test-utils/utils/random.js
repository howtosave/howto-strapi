/* eslint-disable prefer-const */

const crypto = require("crypto");
const uuid = require("uuid");

function randomUUID() {
  return uuid.v4();
}

/**
 * 명시된 사이즈의 랜덤 hexa-decimal 값을 반환함.
 * @param {number} size
 */
function randomHex(size) {
  return crypto
    .randomBytes(Math.ceil(size / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, size); // return required number of characters
}

function randomBase64(size) {
  return crypto
    .randomBytes(Math.ceil((size * 3) / 4))
    .toString("base64") // convert to base64 format
    .slice(0, size) // return required number of characters
    .replace(/\+/g, "0") // replace '+' with '0'
    .replace(/\//g, "0"); // replace '/' with '0'
}

function randomString(size, chars) {
  chars = chars || " abcdefghijklmnopqrstuwxyz ABCDEFGHIJKLMNOPQRSTUWXYZ0 123456789 ";
  let rnd = crypto.randomBytes(size),
    value = new Array(size),
    len = Math.min(256, chars.length),
    d = 256 / len;

  for (let i = 0; i < size; i++) {
    value[i] = chars[Math.floor(rnd[i] / d)];
  }

  return value.join("");
}

/**
 * [low, high) 사이 랜덤 실수값을 반환함. ('[': 이상, ')': 미만)
 * inc(include)가 true인 경우에는 [low, high] 사이값 반환함
 * @param {number} low
 * @param {number} high
 */
function random(high, low = 0, inc = false) {
  const add = inc ? 1 : 0;
  return Math.random() * (high - low + add) + low;
}

/**
 * [low, high) 사이 랜덤 정수값을 반환함. ('[': 이상, ')': 미만)
 * inc(include)가 true인 경우에는 [low, high] 사이값 반환함
 * @param {number} low
 * @param {number} high
 */
function randomInt(high, low = 0, inc = false) {
  const add = inc ? 1 : 0;
  return Math.floor(Math.random() * (high - low + add) + low);
}

function randomIntArray(size, high, low = 0, inc = false) {
  const arr = new Array(size);
  arr.forEach((ele) => (ele = randomInt(high, low, inc)));
  return arr;
}

module.exports = {
  randomHex,
  randomBase64,
  randomString,
  random,
  randomInt,
  randomIntArray,
  randomUUID,
};
