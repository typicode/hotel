# hotel [![Mac/Linux Build Status](https://img.shields.io/travis/typicode/hotel/master.svg?label=Mac%20OSX%20%26%20Linux)](https://travis-ci.org/typicode/hotel) [![Windows Build status](https://img.shields.io/appveyor/ci/typicode/hotel/master.svg?label=Windows)](https://ci.appveyor.com/project/typicode/hotel/branch/master) [![](https://badge.fury.io/js/hotel.svg)](https://www.npmjs.com/package/hotel)

> Start apps from your browser and use local domains/https automatically

![](https://i.imgur.com/eDLgWMj.png)

_Tip: if you don't enable local domains, hotel can still be used as a **catalog of local servers**._

Hotel works great on any OS (macOS, Linux, Windows) and with __all servers :heart:__
* Node (Express, Webpack)
* PHP (Laravel, Symfony)
* Ruby (Rails, Sinatra, Jekyll)
* Python (Django)
* Docker
* Go
* Apache, Nginx
* ...

_To all the amazing people who have answered the Hotel survey, thanks so much <3 !_

## v0.8.0 upgrade

`.localhost` replaces `.dev` local domain and is the new default. See https://ma.ttias.be/chrome-force-dev-domains-https-via-preloaded-hsts/ for context.

If you're upgrading, please be sure to:
1. Remove `"tld": "dev"` from your `~/.hotel/conf.json` file
2. Run `hotel stop && hotel start`
3. Refresh your network settings

## Support

If you are benefiting from hotel, you can support its development on [Patreon](https://patreon.com/typicode).

You can view the list of Supporters here https://thanks.typicode.com.

## Video

* [Starting apps with Hotel - Spacedojo Code Kata by Josh Owens](https://www.youtube.com/watch?v=BHW4tzctQ0k)

## Features

* __Local domains__ - `http://project.localhost`
* __HTTPS via local self-signed SSL certificate__ - `https://project.localhost`
* __Wildcard subdomains__ - `http://*.project.localhost`
* __Works everywhere__ - macOS, Linux and Windows
* __Works with any server__ - Node, Ruby, PHP, ...
* __Proxy__ - Map local domains to remote servers
* __System-friendly__ - No messing with `port 80`, `/etc/hosts`, `sudo` or additional software
* Fallback URL - `http://localhost:2000/project`
* Servers are only started when you access them
* Plays nice with other servers (Apache, Nginx, ...)
* Random or fixed ports

## Install

```sh
npm install -g hotel && hotel start
```

Hotel requires Node to be installed, if you don't have it, you can simply install it using one of the following method:

* https://github.com/creationix/nvm `nvm install stable`
* https://brew.sh `brew install node`

You can also visit https://nodejs.org.

## Quick start

### Local domains (optional)

To use local `.localhost` domains, you need to configure your network or browser to use hotel's proxy auto-config file or you can skip this step for the moment and go directly to http://localhost:2000

[__See instructions here__](https://github.com/typicode/hotel/blob/master/docs/README.md).

### Add your servers

```sh
# Add your server to hotel
~/projects/one$ hotel add 'npm start'
# Or start your server in the terminal as usual and get a temporary local domain
~/projects/two$ hotel run 'npm start' 
```

Visit [localhost:2000](http://localhost:2000) or [http(s)://hotel.localhost](http://hotel.localhost).

Alternatively you can directly go to

```
http://localhost:2000/one
http://localhost:2000/two
```

```
http(s)://one.localhost
http(s)://two.localhost 
```

#### Popular servers examples

Using other servers? Here are some examples to get you started :)

```sh
hotel add 'ember server'                               # Ember
hotel add 'jekyll serve --port $PORT'                  # Jekyll
hotel add 'rails server -p $PORT -b 127.0.0.1'         # Rails
hotel add 'python -m SimpleHTTPServer $PORT'           # static file server (Python)
hotel add 'php -S 127.0.0.1:$PORT'                     # PHP
hotel add 'docker-compose up'                          # docker-compose
hotel add 'python manage.py runserver 127.0.0.1:$PORT' # Django
# ...
```

On __Windows__ use `"%PORT%"` instead of `'$PORT'`

[__See a Docker example here.__](https://github.com/typicode/hotel/blob/master/docs/Docker.md).

### Proxy requests to remote servers

Add your remote servers

```sh
~$ hotel add http://192.168.1.12:1337 --name aliased-address
~$ hotel add http://google.com --name aliased-domain 
```

You can now access them using

```sh
http://aliased-address.localhost # will proxy requests to http://192.168.1.12:1337
http://aliased-domain.localhost # will proxy requests to http://google.com
```

## CLI usage and options

```sh
hotel add <cmd|url> [opts]
hotel run <cmd> [opts]

# Examples

hotel add 'nodemon app.js' --out dev.log  # Set output file (default: none)
hotel add 'nodemon app.js' --name name    # Set custom name (default: current dir name)
hotel add 'nodemon app.js' --port 3000    # Set a fixed port (default: random port)
hotel add 'nodemon app.js' --env PATH     # Store PATH environment variable in server config
hotel add http://192.168.1.10 --name app  # map local domain to URL

hotel run 'nodemon app.js'                # Run server and get a temporary local domain

# Other commands

hotel ls     # List servers
hotel rm     # Remove server
hotel start  # Start hotel daemon
hotel stop   # Stop hotel daemon
```

To get help

```sh
hotel --help
hotel --help <cmd>
```

## Port

For `hotel` to work, your servers need to listen on the PORT environment variable.
Here are some examples showing how you can do it from your code or the command-line:

```js
var port = process.env.PORT || 3000
server.listen(port)
```

```sh
hotel add 'cmd -p $PORT'  # OS X, Linux
hotel add "cmd -p %PORT%" # Windows
```

## Fallback URL

If you're offline or can't configure your browser to use `.localhost` domains, you can __always__ access your local servers by going to [localhost:2000](http://localhost:2000).

## Configurations, logs and self-signed SSL certificate

You can find hotel related files in `~/.hotel` :

```sh
~/.hotel/conf.json
~/.hotel/daemon.log
~/.hotel/daemon.pid
~/.hotel/key.pem
~/.hotel/cert.pem
~/.hotel/servers/<app-name>.json
```

By default, `hotel` uses the following configuration values:

```js
{
  "port": 2000,
  "host": '127.0.0.1',
  
  // Timeout when proxying requests to local domains
  "timeout": 5000,
  
  // Change this if you want to use another tld than .localhost
  "tld": 'localhost', 
  
  // If you're behind a corporate proxy, replace this with your network proxy IP (example: "1.2.3.4:5000")
  "proxy": false
}
```

To override a value, simply add it to `~/.hotel/conf.json` and run `hotel stop && hotel start`

## Third-party tools

* [Hotelier](https://github.com/macav/hotelier) Hotelier (Mac & Windows Tray App)
* [Hotel Clerk](https://github.com/therealklanni/hotel-clerk) OS X menubar
* [HotelX](https://github.com/djyde/HotelX) Another OS X menubar (only 1.6MB)
* [alfred-hotel](https://github.com/exah/alfred-hotel) Alfred 3 workflow
* [Hotel Manager](https://github.com/hardpixel/hotel-manager) Gnome Shell extension

## FAQ

#### Setting a fixed port

```sh
hotel add --port 3000 'server-cmd $PORT' 
```

#### Adding `X-Forwarded-*` headers to requests

```sh
hotel add --xfwd 'server-cmd'
```

#### Setting `HTTP_PROXY` env

Use `--http-proxy-env` flag when adding your server or edit your server configuration in `~/.hotel/servers`

```sh
hotel add --http-proxy-env 'server-cmd'
```

#### Proxying requests to a remote `https` server

```sh
hotel add --change-origin 'https://jsonplaceholder.typicode.com'
```

_When proxying to a `https` server, you may get an error because your `.localhost` domain doesn't match the host defined in the server certificate. With this flag, `host` header is changed to match the target URL._

#### `ENOSPC` and `EACCES` errors

If you're seeing one of these errors in `~/.hotel/daemon.log`, this usually means that there's some permissions issues. `hotel` daemon should be started without `sudo` and `~/.hotel` should belong to `$USER`.

```sh
# to fix permissions
sudo chown -R $USER: $HOME/.hotel
```

See also, https://docs.npmjs.com/getting-started/fixing-npm-permissions

#### Configuring a network proxy IP

If you're behind a corporate proxy, replace `"proxy"` with your network proxy IP in `~/.hotel/conf.json`. For example:

```json
{
  "proxy": "1.2.3.4:5000"
}
```

## License

MIT

[Patreon](https://www.patreon.com/typicode) - [Supporters](https://thanks.typicode.com) ✨
