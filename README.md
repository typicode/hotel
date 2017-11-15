<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/6WUB3WBwbmZXbZxzrUv5y2A5/typicode/hotel'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/6WUB3WBwbmZXbZxzrUv5y2A5/typicode/hotel.svg' />
</a>

# hotel [![Mac/Linux Build Status](https://img.shields.io/travis/typicode/hotel/master.svg?label=Mac%20OSX%20%26%20Linux)](https://travis-ci.org/typicode/hotel) [![Windows Build status](https://img.shields.io/appveyor/ci/typicode/hotel/master.svg?label=Windows)](https://ci.appveyor.com/project/typicode/hotel/branch/master) [![](https://badge.fury.io/js/hotel.svg)](https://www.npmjs.com/package/hotel)

> Start apps from your browser and get local domains in seconds!

![](http://i.imgur.com/DrLjbIi.gif)

_Tip: if you don't enable local domains, hotel can still be used as a **catalog of local servers**._

Hotel works great on any OS (OS X, Linux, Windows) and with __all servers :heart:__
* Node (Express, Webpack)
* PHP (Laravel, Symfony)
* Ruby (Rails, Sinatra, Jekyll)
* Python (Django)
* Docker
* Go
* Apache, Nginx
* ...

## Sponsorship

Development of Hotel is generously supported by contributions from people. If you are benefiting from my projects and would like to help keep them financially sustainable, please visit [Patreon](https://patreon.com/typicode).

## Video

* [Starting apps with Hotel - Spacedojo Code Kata by Josh Owens](https://www.youtube.com/watch?v=BHW4tzctQ0k)

## Features

* __Local domains__ - `http://project.dev`
* __HTTPS via self-signed certificate__ - `https://project.dev`
* __Wildcard subdomains__ - `http://*.project.dev`
* __Works everywhere__ - OS X, Linux and Windows
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

### Local dev domains (optional)

To use local `.dev` domains, you need to configure your network or browser to use hotel's proxy auto-config file or you can skip this step for the moment and go directly to http://localhost:2000

[__See instructions here__](https://github.com/typicode/hotel/blob/master/docs/README.md).

### Servers

Add your servers commands

```sh
~/projects/one$ hotel add nodemon
~/projects/two$ hotel add 'serve -p $PORT'
```

Go to [localhost:2000](http://localhost:2000) or [hotel.dev](http://hotel.dev).

Alternatively you can directly go to

```
http://localhost:2000/one
http://localhost:2000/two
```

```
http://one.dev
http://two.dev
```

```
https://one.dev
https://two.dev
```

__Tip__ you can also use `hotel run <cmd>` to start your server in the terminal and get a temporary local domain.

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

### Proxy

Add your remote servers

```sh
~$ hotel add http://some-domain.com --name local-domain 
~$ hotel add http://192.168.1.12:1337 --name aliased-address
```

You can now access them using

```sh
http://local-domain.dev # will proxy requests to http://some-domain.com
http://aliased-address.dev # will proxy requests to http://192.168.1.12:1337
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

If you're offline or can't configure your browser to use `.dev` domains, you can __always__ access your local servers by going to [localhost:2000](http://localhost:2000).

## Configurations and logs

`~/.hotel` contains daemon logs, servers and daemon configurations.

```sh
~/.hotel/conf.json
~/.hotel/daemon.log
~/.hotel/daemon.pid
~/.hotel/servers/<app-name>.json
```

By default, `hotel` uses the following configuration values:

```js
{
  "port": 2000,
  "host": '127.0.0.1',
  "timeout": 5000,
  "tld": 'dev',
  "proxy": false
}
```

You can override them in `~/.hotel/conf.json`.

## Third-party tools

* [Hotel Clerk](https://github.com/therealklanni/hotel-clerk) OS X menubar
* [HotelX](https://github.com/djyde/HotelX) Another OS X menubar (only 1.6MB)
* [alfred-hotel](https://github.com/exah/alfred-hotel) Alfred 3 workflow
* [Hotel Manager](https://github.com/hardpixel/hotel-manager) Gnome Shell extension

## FAQ

#### Seting a fixed port

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

_When proxying to a `https` server, you may get an error because your local `.dev` domain doesn't match the host defined in the server certificate. With this flag, `host` header is changed to match the target URL._

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

MIT - [Typicode :cactus:](https://github.com/typicode)
