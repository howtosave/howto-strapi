//
// strapi Auth API
//
class StrapiAuth {

  constructor(baseUrl) {
    this.request = axios.create({
      baseUrl,
      timeout: 5000,
    });
    this.user = null;
  }

  _setAuth(authBody) {
    if (authBody) {
    this.user = authBody.user;
    this.request.defaults.headers.common["Authorization"] = `Bearer ${authBody.jwt}`;
    } else {
      this.user = null;
      this.request.defaults.headers.common["Authorization"] = "";
    }
  }

  _handleException(e) {
    if (e.response) return e.response;
      return {
        status: 0,
        error: e.message,
        config: e.config,
      }
  }

  // login
  async login(email, password) {
    try {
      const res = await this.request({
        method: 'post',
        url: `/auth/local`,
        data: {
          identifier: email,
          password,
        }
      });
      this._setAuth(res.data);
      return res;
    } catch (e) {
      return this._handleException(e);
    }
  }

  // logout
  logout() {
    this._setAuth(null);
  }

  // register
  async register(email, password, username) {
    try {
      const res = await this.request({
        method: 'post',
        url: `/auth/local/register`,
        data: {
          email,
          password,
          username,
        }
      });
      this._setAuth(res.data);
      return res;
    } catch (e) {
      return this._handleException(e);
    }
  }

  getUser() {
    return this.user;
  }
};
