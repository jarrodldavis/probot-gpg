require('dotenv').config();

const http = require('http');
const createProbot = require('probot');
const nock = require('nock');

const Plugin = require('../lib/plugin');

const tokenRequest = require('./fixtures/token-request');

const createAppJwt = require('./utils/create-app-jwt');
const createAppId = require('./utils/create-app-id');
const createPrivateKey = require('./utils/create-private-key');
const createSha = require('./utils/create-sha');
const createWebhookSignature = require('./utils/create-webhook-signature');
const FixtureNockScope = require('./utils/fixture-nock-scope');

const apiScope = 'https://api.github.com:443';

function arrangeApi(probotOptions, compareCommitsRequest, createStatusRequest) {
  const appJwt = createAppJwt(
    new Date('2017-05-21T23:45:59.000Z'),
    probotOptions.id,
    probotOptions.cert
  );

  const authorizedTokenRequest = Object.assign({}, tokenRequest);
  authorizedTokenRequest.request.headers.Authorization = 'Bearer ' + appJwt;

  const token = 'v1.' + createSha();
  authorizedTokenRequest.response.body.token = token;
  compareCommitsRequest.request.headers.Authorization = 'token ' + token;
  createStatusRequest.request.headers.Authorization = 'token ' + token;

  return new FixtureNockScope(apiScope)
    .interceptFromFixture(authorizedTokenRequest)
    .interceptFromFixture(compareCommitsRequest)
    .interceptFromFixture(createStatusRequest);
}

// eslint-disable-next-line prefer-arrow-callback
describe('integration', function () {
  this.slow(3000);
  this.timeout(5000);

  let probotOptions = null;

  before(async () => {
    probotOptions = {
      id: process.env.APP_ID || createAppId(),
      secret: process.env.WEBHOOK_SECRET || createSha(),
      cert: process.env.PRIVATE_KEY || await createPrivateKey(),
      port: 3000
    };

    nock.disableNetConnect();
    nock.enableNetConnect('localhost:3000');
  });

  after(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should create a status when a pull request is opened', done => {
    let server = null;

    function close(err) {
      if (server !== null) {
        server.close();
      }
      done(err);
    }

    const api = arrangeApi(
      probotOptions,
      require('./fixtures/opened/compare-commits'),
      require('./fixtures/opened/create-status')
    );

    const plugin = new Plugin();
    plugin.on('error', err => close(err));
    plugin.on('event-handled', () => {
      api.nock.done();
      close();
    });

    const probot = createProbot(probotOptions);

    plugin.on('loaded', () => {
      const { method, path, headers, body } = require('./fixtures/opened/webhook-request').request;
      headers['X-Hub-Signature'] = createWebhookSignature(probotOptions.secret, body);
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        method,
        path,
        headers
      });

      req.on('error', err => close(err));

      req.write(JSON.stringify(body));
      req.end();
    });

    server = probot.server.listen(probotOptions.port);
    probot.load(plugin.load.bind(plugin));
  });
});
