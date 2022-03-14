//
// strapi API
//
class StrapiApi {
  constructor(baseUrl, gqlPath = "") {
    this._request = axios.create({
      baseUrl,
      timeout: 5000,
    });
    this.user = null;
    this.gqlPath = gqlPath;
  }

  _setAuth(authBody) {
    if (authBody) {
    this.user = authBody.user;
    this._request.defaults.headers.common["Authorization"] = `Bearer ${authBody.jwt}`;
    } else {
      this.user = null;
      this._request.defaults.headers.common["Authorization"] = "";
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
      const res = await this._request({
        method: 'post',
        url: `/auth/local`,
        headers: { 'Content-Type': 'application/json' },
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
      const res = await this._request({
        method: 'post',
        url: `/auth/local/register`,
        headers: { 'Content-Type': 'application/json' },
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

  async request(config) {
    try {
      return await this._request(config);
    } catch (e) {
      return this._handleException(e);
    }
  }

  async graphql(query, variables = undefined) {
    try {
      const res = await this._request({
        method: 'post',
        url: this.gqlPath,
        headers: { 'Content-Type': 'application/json' },
        data: {
          query,
          variables,
        },
      });
      return res;
    } catch (e) {
      return this._handleException(e);
    }
  }
};
