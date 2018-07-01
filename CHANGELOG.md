# Change Log

## 0.8.7

* Fix UI menu overflow

## 0.8.6

* Fix `The listener must be a function` error

## 0.8.5

* Fix colors in output

## 0.8.4

* Fix UI crash

## 0.8.3

* Fix error in Edge
* Improve bundle size

## 0.8.2 

* UI

## 0.8.1

* Fix error page

## 0.8.0

* Create empty `conf.json` if it doesn't exist
* Update UI
  * New 2018 style 🎉
  * Links now open in new tabs (should improve integration with third-party tools)
* Update all dependencies

__Breaking__

* Drop Internet Explorer 11 support for the UI
* Drop Node 4 support
* Self-signed certicate is now generated locally and can be found in `~/.hotel`. Since it's going to be a new one, you'll need to "trust" it again to be able to use `https`
* __`.localhost` is now the default domain and replaces `.dev` domains__ (if present, remove `"tld": "dev"` from `~/.hotel/conf.json` to use the new default value, then run `hotel stop && hotel start`)

## 0.7.6

* Fix `package.json` not found error

## 0.7.5

* Add [please-upgrade-node](https://github.com/typicode/please-upgrade-node)
* Chore: update all dependencies

## 0.7.4

* Remove `util.log` which has been deprecated in Node 6

## 0.7.3

* Prevent `hotel ls` from crashing when listing malformed files [#190](https://github.com/typicode/hotel/pull/190)

## 0.7.2

* Update error page UI
* Update Self-Signed SSL Certificate (__you may need to add an exception again__)
* Fix Vue warning message in UI

## 0.7.1

* Fix daemon error

## 0.7.0

* Add `run` command
* Add `http-proxy-env` flag to `hotel add`
* Drop Node `0.12` support

__Breaking__

* By default no `HTTP_PROXY` env will be passed to servers. To pass `HTTP_PROXY` you need to set it in your server configuration or use the flag `http-proxy-env` when adding your server.

## 0.6.1

* Prevent using unsupported characters with `hotel add --name` [#100](https://github.com/typicode/hotel/issues/100)

## 0.6.0

* Add `--xfwd` and `--change-origin` flags to `hotel add` command
* Log proxy errors

__Breaking__

* If you want hotel to add `X-Forwarded-*` headers to requests, you need now to explicitly pass `-x/--xfwd` flags when adding a server.

## 0.5.13

* Fix `hotel add` CLI bug

## 0.5.12

* Add dark theme
* Update `X-Forwarded-Port` header
* Improve `ember-cli` and `livereload` support

## 0.5.11

* Add more `X-Forwarded-*` headers

## 0.5.10

* Pass `HTTP_PROXY` env to servers started by hotel

## 0.5.9

* UI bug fix

## 0.5.8

* Add `favicon`
* Fix Safari and IE bug

## 0.5.6

* Fix Safari bug

## 0.5.5

* Add `X-Forwarded-Proto` header for ssl proxy
* Support an array of environment variables for the CLI option `--env`
* UI enhancements

## 0.5.4

* Fix Node 0.12 issue

## 0.5.3

* UI tweaks

## 0.5.2

* Fix option alias issue [#109](https://github.com/typicode/hotel/issues/109)

## 0.5.1

* Fix conf issue

## 0.5.0

* Various UI improvements
* Add URL mapping support, for example `hotel add http://192.168.1.10 --name remote-server`
* Change `hotel rm` options

## 0.4.22

* UI tweaks

## 0.4.21

* Fix UI issue with IE

## 0.4.20

* Fix UI issue with Safari 9

## 0.4.19

* Support ANSI colors in the browser

## 0.4.18

* Bug fix

## 0.4.17

* Add `proxy` conf, use it if you're behind a corporate proxy.
* Bug fix

## 0.4.16

* Fix issue with project names containing characters not allowed for a domain name. By default, `hotel add` will now convert name to lower case and will replace space and `_` characters. However, you can still use `-n` to force a specific name or specific characters.

## 0.4.15

* Fix blank page issue in `v0.4.14`.

## 0.4.14

* Fix UI issues.

## 0.4.13

* Fix issue with Node 0.12.

## 0.4.12

* Add wildcard subdomains `http://*.app.localhost`.

## 0.4.11

* Strip ANSI when viewing logs in the browser.

## 0.4.10

* Fix IE and Safari issue (added fetch polyfill).

## 0.4.9

* Add server logs in the browser.
* Bundle icons to make them available without network access.
* Bug fixes.

## 0.4.8

* Bug fix

## 0.4.7

* Bundle front-end dependencies to make homepage work without network access.
* Support subdomains `http://sub.app.localhost`.
* Support `https` and `wss`.

## 0.4.6

* Bug fixes (0.4.3 to 0.4.5 deprecated).
* Added `~/.hotel/daemon.pid` file.

## 0.4.3

* UI update.
* Added top-level domain configuration option `tld`.
* Added IE support.

## 0.4.2

* Removed `socket.io` dependency.

## 0.4.1

* Added WebSocket support for projects being accessed using local `.localhost` domain.

## 0.4.0

* Added Local `.localhost` domain support for HTTP requests.
