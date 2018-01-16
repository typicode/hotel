const punycode = require('punycode') // eslint-disable-line node/no-deprecated-api

module.exports = function normalize(name) {
  return name
    ? punycode
        .encode(name)
        .toLowerCase()
        .replace(/[^a-z0-9-.]/g, '-')
        .replace(/-+/g, '-')
        .replace(/-$/, '')
    : name
}
