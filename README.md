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

```bash
npm install -g hotel && hotel start
```

Hotel requires Node to be installed, if you don't have it, you can simply install it using one of the following method.

```sh
# http://brew.sh
brew install node

# https://github.com/creationix/nvm
nvm install stable
```

You can also visit https://nodejs.org.

## Quick start

### Local dev domains (optional)

To use local `.dev` domains, you need to configure your network or browser to use hotel's proxy auto-config file or you can skip this step for the moment and go directly to http://localhost:2000

[__See instructions here__](https://github.com/typicode/hotel/blob/master/docs/README.md).

### Servers

Add your servers commands

```bash
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

#### Popular servers examples

Using other servers? Here are some examples to get you started :)

```bash
hotel add 'ember server'
hotel add 'jekyll serve --port $PORT'
hotel add 'rails server -p $PORT -b 127.0.0.1'
hotel add 'python -m SimpleHTTPServer $PORT'
hotel add 'php -S 127.0.0.1:$PORT'
# ...
```

On __Windows__ use `"%PORT%"` instead of `'$PORT'`

### Proxy

Add your remote servers

```bash
~$ hotel add http://foo.com --name bar
~$ hotel add http://192.168.1.12:1337 --name some-server
```

You can now access them using

```bash
http://bar.dev # http://foo.com
http://some-server.dev # http://192.168.1.12:1337
```

## CLI usage and options

```bash
hotel add <cmd|url> [opts]

# Examples:
hotel add 'nodemon app.js' --out dev.log  # Set output file (default: none)
hotel add 'nodemon app.js' --name name    # Set custom name (default: current dir name)
hotel add 'nodemon app.js' --port 3000    # Set a fixed port (default: random port)
hotel add 'nodemon app.js' --env PATH     # Store PATH environment variable in server config
hotel add http://192.168.1.10 --name app  # map local domain to URL

# Other commands
hotel ls     # List servers
hotel rm     # Remove server
hotel start  # Start hotel daemon
hotel stop   # Stop hotel daemon
```

To get help

```bash
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

```bash
hotel add 'cmd -p $PORT'  # OS X, Linux
hotel add "cmd -p %PORT%" # Windows
```

## Fallback URL

If you're offline or can't configure your browser to use `.dev` domains, you can __always__ access your local servers by going to [localhost:2000](http://localhost:2000).

## Configurations and logs

`~/.hotel` contains daemon logs, servers and daemon configurations.

```bash
~/.hotel/conf.json
~/.hotel/daemon.log
~/.hotel/daemon.pid
~/.hotel/servers/<app-name>.json
```

## Third-party tools

* [Hotel Clerk](https://github.com/therealklanni/hotel-clerk) OS X menubar
* [HotelX](https://github.com/djyde/HotelX) Another OS X menubar (only 1.6MB)

## License

MIT - [Typicode](https://github.com/typicode)
