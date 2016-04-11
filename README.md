# hotel [![Mac/Linux Build Status](https://img.shields.io/travis/typicode/hotel/master.svg?label=Mac%20OSX%20%26%20Linux)](https://travis-ci.org/typicode/hotel) [![Windows Build status](https://img.shields.io/appveyor/ci/typicode/hotel/master.svg?label=Windows)](https://ci.appveyor.com/project/typicode/hotel/branch/master) [![](https://badge.fury.io/js/hotel.svg)](https://www.npmjs.com/package/hotel)

> No need to worry about ports, remember commands, manage terminal tabs, mess with /etc/hosts ... access and start your servers from the browser. You can even use local `.dev` domains or any other tld, and it works everywhere (OS X, Linux, Windows) :+1:

![](http://i.imgur.com/dAhxGMj.gif)


## Features

* __Shortcut access__ (`http://localhost:2000/project`)
* __Local domain support__ (`http://project.dev` *)
* __SSL support via self-signed certificate__ (`https://project.dev` *)
* __Servers are only started when you access them__
* Works with any server (Node, Ruby, PHP, ...)
* Cross-platform (OS X, Linux and Windows)
* Plays nice with other servers (Apache, Nginx, ...)
* No port 80, /etc/hosts or admin/root privileges needed
* Random or fixed ports
* See Roadmap for upcoming features :)

_* Local `.dev` domains are optional. To use them, configure your network or browser to use hotel's proxy auto-config file (`proxy.pac`). See instructions [here](https://github.com/typicode/hotel/blob/master/docs/README.md)._

## Install

```bash
npm install -g hotel && hotel start
```

If you don't have Node installed, use [brew](http://brew.sh/) or [nvm](https://github.com/creationix/nvm).

## Quick start

Add your servers commands.

```bash
~/projects/one$ hotel add nodemon
~/projects/two$ hotel add 'serve -p $PORT'
```

Now, you can access, start and stop your servers from [localhost:2000](http://localhost:2000) or [hotel.dev](http://hotel.dev).

And you get access to the following URLs:

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

Here are some other servers examples:

```bash
hotel add 'jekyll --port $PORT'
hotel add 'rails server --port $PORT'
hotel add 'python -m SimpleHTTPServer $PORT'
hotel add 'php -S 127.0.0.1:$PORT'
# ...
```

On __Windows__ use `"%PORT%"` instead of `'$PORT'`

## CLI usage and options

```bash
hotel add <cmd> [opts]

# Examples:
hotel add 'nodemon app.js' -o out.log # Set output file (default: none)
hotel add 'nodemon app.js' -n name    # Set custom name (default: current dir name)
hotel add 'nodemon app.js' -p 3000    # Set a fixed port (default: random port)
hotel add 'nodemon app.js' -e PATH    # Store PATH environment variable in server config
hotel add 'nodemon app.js' -w         # Enable wildcards in Dev domains (see below)

# Other commands
hotel ls        # List servers
hotel rm [name] # Remove server
hotel start     # Start hotel daemon
hotel stop      # Stop hotel daemon
```

## Port

For `hotel` to work, your servers need to listen on the PORT environment variable.
Here are some examples showing how you can do it from your code or the command-line:

```javascript
var port = process.env.PORT || 3000
server.listen(port)
```

```bash
hotel add 'cmd -p $PORT'  # OS X, Linux
hotel add "cmd -p %PORT%" # Windows
```

## Dev domain support

 See instructions [here](https://github.com/typicode/hotel/blob/master/docs/README.md).

## Configurations and logs

`~/.hotel` contains daemon log, servers and daemon configurations.

```bash
~/.hotel/conf.json
~/.hotel/daemon.log
~/.hotel/daemon.pid
~/.hotel/servers/<app-name>.json
```

## Third-party tools

* [Hotel Clerk](https://github.com/therealklanni/hotel-clerk) OS X menubar
* [HotelX](https://github.com/djyde/HotelX) Another OS X menubar (only 1.6MB)

## Roadmap

- [X] In-browser logs
- [ ] Sub-domains support

## License

MIT - [Typicode](https://github.com/typicode)
