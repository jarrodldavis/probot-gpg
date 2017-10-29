const pki = require('node-forge').pki

module.exports = () => new Promise((resolve, reject) => {
  pki.rsa.generateKeyPair({ bits: 1024 }, (err, keyPair) => {
    if (err !== null && err !== undefined) {
      reject(err)
    } else {
      resolve(pki.privateKeyToPem(keyPair.privateKey))
    }
  })
})
