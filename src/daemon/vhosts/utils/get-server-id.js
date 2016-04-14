const matcher = require('matcher')
const find = require('array-find') // Node 0.12 ponyfill

// "wildcard" host matching
// (['app'], 'foo.app') -> app
// (['app', 'foo.app'], 'foo.app') -> foo.app
module.exports = (hosts, host) => {
  const arr = hosts
    .sort()
    .reverse()
    .map(h => ({
      host: h,
      strict: matcher.isMatch(host, h),
      wildcard: matcher.isMatch(host, `*.${h}`)
    }))

  const strictMatch = find(arr, h => h.strict)
  const wildcardMatch = find(arr, h => h.wildcard)

  if (strictMatch) return strictMatch.host
  if (wildcardMatch) return wildcardMatch.host
}
