require('dotenv').config();

const http = require('http');
const createProbot = require('probot');
const nock = require('nock');

const Plugin = require('../lib/plugin');

const tokenRequest = require('./fixtures/token-request');

const createIntegrationJwt = require('./utils/create-integration-jwt');
const createSha = require('./utils/create-sha');
const createWebhookSignature = require('./utils/create-webhook-signature');
const FixtureNockScope = require('./utils/fixture-nock-scope');

const apiScope = 'https://api.github.com:443';

function throwError(message) {
  throw new Error(message);
}

const probotOptions = {
  id: process.env.INTEGRATION_ID || throwError('Integration ID not specified.'),
  secret: process.env.WEBHOOK_SECRET || 'development',
  cert: process.env.PRIVATE_KEY || throwError('Private Key not specified.'),
  port: 3000
};

function arrangeProbot(plugin) {
  const probot = createProbot(probotOptions);

  probot.load(plugin.load.bind(plugin));

  return probot;
}

function arrangeApi(compareCommitsRequest, createStatusRequest) {
  const integrationJwt = createIntegrationJwt(
    new Date('2017-05-21T23:45:59.000Z'),
    probotOptions.id,
    probotOptions.cert
  );

  const authorizedTokenRequest = Object.assign({}, tokenRequest);
  authorizedTokenRequest.request.headers.Authorization = 'Bearer ' + integrationJwt;

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

  before(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('localhost:3000');
  });

  after(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should create a status when a pull request is opened', done => {
    const api = arrangeApi(
      require('./fixtures/open/compare-commits'),
      require('./fixtures/open/create-status')
    );

    const plugin = new Plugin();
    plugin.on('error', err => done(err));
    plugin.on('event-handled', () => {
      api.nock.done();
      done();
    });

    const probot = arrangeProbot(plugin);

    probot.server.on('listening', () => {
      const { method, path, headers, body } = require('./fixtures/open/webhook-request').request;
      headers['X-Hub-Signature'] = createWebhookSignature(probotOptions.secret, body);
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        method,
        path,
        headers
      });

      req.on('error', err => done(err));

      req.write(JSON.stringify(body));
      req.end();
    });

    probot.start();
  });
});
