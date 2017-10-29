const jwt = require('jsonwebtoken')

module.exports = (issuedAt, appId, key) => {
  const iat = Math.floor(issuedAt / 1000)
  return jwt.sign({ iat, exp: iat + 60, iss: appId }, key, { algorithm: 'RS256' })
}
