const crypto = require('crypto');

module.exports = (secret, payload) => 'sha1=' + crypto.createHmac('sha1', secret)
                                                      .update(JSON.stringify(payload))
                                                      .digest('hex');
