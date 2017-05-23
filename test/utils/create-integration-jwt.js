const jwt = require('jsonwebtoken');

module.exports = (issuedAt, integrationid, key) => {
  const iat = Math.floor(issuedAt / 1000);
  return jwt.sign({ iat, exp: iat + 60, iss: integrationid }, key, { algorithm: 'RS256' });
};
