const _ = require("lodash");
const crypto = require("crypto");
const { sanitizeEntity } = require("strapi-utils");

const INTERNAL_PASSWORD = "Zd@d@23DCVd";
// 'user', 'users-permissions'
const _cores = (name = "user") => ({
  query: strapi.query(name, "users-permissions"), // Util functions for database query
  model: strapi.query(name, "users-permissions").model, // To access the underlying ORM model.
});

const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const formatError = (error) => ({ id: error.id, message: error.message, field: error.field });

const getPluginStore = async (pluginName = "users-permissions") =>
  await strapi.store({
    environment: "",
    type: "plugin",
    name: pluginName,
  });

const getAdvacedSettings = async (pluginStore) =>
  await pluginStore.get({
    key: "advanced",
  });

const getDefaultRole = async (pluginStore) => {
  const settings = await getAdvacedSettings(pluginStore);
  return await strapi
    .query("role", "users-permissions")
    .findOne({ type: settings.default_role }, []);
};

/**
 * JWT En/Decryption
 */
const key = crypto.scryptSync(INTERNAL_PASSWORD, "salt", 24);
const iv = Buffer.alloc(16, 0); // Initialization vector.
const JWT_CODE_ENCODING = "base64";

const _encryptJwtCode = (id, date = new Date()) => {
  // jwt code: id(24 bytes) + date(24 bytes)
  const jwtCode = `${id}${date.toJSON()}`;
  const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);

  strapi.log.debug("jwt code:", jwtCode);

  let encrypted = cipher.update(jwtCode, "utf8", JWT_CODE_ENCODING);
  encrypted += cipher.final(JWT_CODE_ENCODING);
  return encrypted;
};

const _decryptJwtCode = (encrypted) => {
  try {
    const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv);
    let decrypted = decipher.update(encrypted, JWT_CODE_ENCODING, "utf8");
    decrypted += decipher.final("utf8");

    strapi.log.debug("decrypted jwt code:", decrypted);

    let jwtCode = null;
    if (decrypted && decrypted.length === 48) {
      jwtCode = {
        id: decrypted.substring(0, 24),
        date: decrypted.substring(24),
      };
    }
    strapi.log.debug("json jwt code:", JSON.stringify(jwtCode));
    return jwtCode;
  } catch (e) {
    strapi.log.error(e.message);
    return null;
  }
};

/**
 * Exported functions
 */

module.exports = {
  /**
   * Login as a guest user
   *
   * params.id가 empty value이면 새로운 Guest User를 생성하고 Auth Response를 반환하고
   * params.id가 기존하는 Guest User이면 해당 유저의 Auth Response를 반환하고
   * params.id가 invalid하면 Failure Response를 반환한다.
   *
   * @param {string} ctx.query.id 로컬에 저장된 Guest User ID
   */
  async localAsGuest(ctx) {
    const pluginStore = await getPluginStore("users-permissions");
    const { id } = ctx.query; //ctx.request.body;

    try {
      let user = !id ? {} : await strapi.query("user", "users-permissions").findOne({ id });

      if (!id) {
        // create user
        const role = await getDefaultRole(pluginStore);
        const username = `guest_${new Date().getTime()}`;
        user = await strapi.query("user", "users-permissions").create({
          username: username,
          email: `${username}@local.host`,
          role: role.id,
          password: await strapi.plugins["users-permissions"].services.user.hashPassword(
            INTERNAL_PASSWORD
          ),
          provider: "guest",
        });
        strapi.log.debug(
          "[PK]>>> localAsGuest(): created new guest user",
          user
        );
      } else {
        if (!user || (user && user.provider !== "guest")) {
          // invalid _id
          return ctx.badRequest(
            null,
            formatError({
              id: "Auth.login.error",
              message: "Invalid id: " + id,
            })
          );
        }
        strapi.log.debug(
          "[PK]>>> localAsGuest(): existing user",
          user
        );
      }

      //
      // success responsee
      const jwt = strapi.plugins["users-permissions"].services.jwt.issue(
        _.pick(user.toJSON ? user.toJSON() : user, ["id"])
      );

      return ctx.send({
        jwt,
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
          model: strapi.query("user", "users-permissions").model,
        }),
      });
    } catch (err) {
      strapi.log.error(err);
      ctx.badRequest(
        null,
        formatError({
          id: "Auth.login.error",
          //message: `Error: ${err.message}`
          message: id ? `Invalid id: ${id}` : `ERROR`,
        })
      );
    }
  },
};
