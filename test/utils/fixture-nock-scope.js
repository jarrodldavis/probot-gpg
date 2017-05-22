const nock = require('nock');

module.exports = class FixtureNockScope {
  constructor(scope) {
    this.nock = nock(scope);
  }

  interceptFromFixture(fixture) {
    const { request, response } = fixture;
    this.nock
      .intercept(request.path, request.method, request.body, { reqheaders: request.headers })
      .reply(response.status, response.body, Object.entries(response.headers));
    return this;
  }
};
