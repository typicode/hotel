const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const request = require('sync-request')

const { serversDir, getServerFile } = require('../common')
const conf = require('../conf')

const api = exports

api.host = `http://${conf.host}:${conf.port}`
api.root = `${api.host}/_/`

/*
 * ██   ██ ███████ ██      ██████  ███████ ██████  ███████
 * ██   ██ ██      ██      ██   ██ ██      ██   ██ ██
 * ███████ █████   ██      ██████  █████   ██████  ███████
 * ██   ██ ██      ██      ██      ██      ██   ██      ██
 * ██   ██ ███████ ███████ ██      ███████ ██   ██ ███████
 */

/**
 * Fetch something from the API
 * @param  {string} route          The route to fetch data from
 * @param  {string} [method="GET"] The method to request with
 * @return {string}                The raw response body (UTF-8 encoded)
 */
api.fetch = (route, method = 'GET') =>
  request(method, api.root + route).getBody('utf-8')

/**
 * Load data from the API as JSON
 * @param  {string}       route          The route to fetch data from
 * @param  {string}       [method="GET"] The method to request with
 * @return {Object|Array}                The JSON data
 */
api.json = (route, method) => JSON.parse(api.fetch(route, method))

/*
 * ██████   ██████  ██    ██ ████████ ███████ ███████
 * ██   ██ ██    ██ ██    ██    ██    ██      ██
 * ██████  ██    ██ ██    ██    ██    █████   ███████
 * ██   ██ ██    ██ ██    ██    ██    ██           ██
 * ██   ██  ██████   ██████     ██    ███████ ███████
 */

api.servers = () => {
  const serverJSON = api.json('servers')
  return Object.keys(serverJSON).map(key => [key, serverJSON[key]])
}
api.server = id => ({
  // TODO: api.server().get() to fetch metadata
  start: () => api.fetch(`servers/${id}/start`, 'POST'),
  stop: () => api.fetch(`servers/${id}/stop`, 'POST')
})

/*
 * ███████ ██   ██ ████████ ██████   █████  ███████
 * ██       ██ ██     ██    ██   ██ ██   ██ ██
 * █████     ███      ██    ██████  ███████ ███████
 * ██       ██ ██     ██    ██   ██ ██   ██      ██
 * ███████ ██   ██    ██    ██   ██ ██   ██ ███████
*/

api.getServerList = () => {
  let servers
  let fromApi
  try {
    // load from the API
    servers = api.servers()
    servers.forEach(([k, server]) => {
      if (server.command) {
        server.cmd = server.command[server.command.length - 1]
      }
    })
    fromApi = true
  } catch (e) {
    fromApi = false
    // load from the config files
    // no status available
    mkdirp.sync(serversDir)
    servers = fs
      .readdirSync(serversDir)
      .map(file => {
        const id = path.basename(file, '.json')
        const serverFile = getServerFile(id)
        let server

        try {
          server = JSON.parse(fs.readFileSync(serverFile))
        } catch (error) {
          // Ignore mis-named or malformed files
          return
        }

        return [id, server]
      })
      .filter(x => x)
  }
  return { servers, fromApi }
}
