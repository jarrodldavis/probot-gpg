const crypto = require('crypto');

module.exports = () => crypto.createHash('sha1').digest('hex');
