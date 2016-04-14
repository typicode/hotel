const matcher = require('matcher')

// Wildcard host matching
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

  const strictMatch = arr.find(h => h.strict)
  const wildcardMatch = arr.find(h => h.wildcard)

  if (strictMatch) return strictMatch.host
  if (wildcardMatch) return wildcardMatch.host
}
