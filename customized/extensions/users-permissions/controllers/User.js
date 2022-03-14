
const { sanitizeEntity } = require('strapi-utils');
const { isObjectId } = require("my-api-utils");

const _sanitizeUser = user =>
  sanitizeEntity(user, {
    model: strapi.query('user', 'users-permissions').model,
  });

module.exports = {

  /**
   * update user properties
   * 
   * @param {*} ctx 
   */
  async update(ctx) {
    const { id } = ctx.params;
    // check id caused 'CastError: Cast to ObjectId failed for value...'
    if (!id || !isObjectId(id) || id !== ctx.state.user.id) {
      return ctx.badRequest("invalid");
    }

    const { email, username, password } = ctx.request.body;
    if (email === "" || username === "") {
      return ctx.badRequest({
        id: "err.invalid",
        message: "empty string value is not allowed"
      });
    }

    const user = await strapi.plugins["users-permissions"].services.user.fetch({ id });

    // password for 'local' provider
    if ( !password && user.provider !== "local") {
      return ctx.badRequest({
        id: "err.invalid",
        message: "password change is not allowed"
      });
    }
    // not allowed the same username
    if ( !username ) {
      const userWithSameUsername = await strapi.query("user", "users-permissions").findOne({ username });
      if (userWithSameUsername && userWithSameUsername.id != id) {
        return ctx.badRequest({
          id: "err.invalid",
          message: "username is already taken"
        });
      }      
    }

    const updateData = {
      ...ctx.request.body,
    };
    if (password === user.password) {
      delete updateData.password;
    }

    const data = await strapi.plugins["users-permissions"].services.user.edit({ id }, updateData);

    ctx.send(_sanitizeUser(data));    
  },

};
