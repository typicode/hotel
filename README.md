# chalet [![](https://badge.fury.io/js/chalet.svg)](https://www.npmjs.com/package/chalet)

> Start apps from your browser and use local domains/https automatically

**Note: This is a maintained fork of [hotel](https://github.com/typicode/hotel), which seems to have grown stale.**

![](https://i.imgur.com/eDLgWMj.png)

_Tip: if you don't enable local domains, chalet can still be used as a **catalog of local servers**._

Chalet works great on any OS (macOS, Linux, Windows) and with **all servers :heart:**

- Node (Express, Webpack)
- PHP (Laravel, Symfony)
- Ruby (Rails, Sinatra, Jekyll)
- Python (Django)
- Docker
- Go
- Apache, Nginx
- ...

## v0.8.0 upgrade

`.localhost` replaces `.dev` local domain and is the new default. See https://ma.ttias.be/chrome-force-dev-domains-https-via-preloaded-hsts/ for context.

If you're upgrading, please be sure to:

1. Remove `"tld": "dev"` from your `~/.chalet/conf.json` file
2. Run `chalet stop && chalet start`
3. Refresh your network settings

## Features

- **Local domains** - `http://project.localhost`
- **HTTPS via local self-signed SSL certificate** - `https://project.localhost`
- **Wildcard subdomains** - `http://*.project.localhost`
- **Works everywhere** - macOS, Linux and Windows
- **Works with any server** - Node, Ruby, PHP, ...
- **Proxy** - Map local domains to remote servers
- **System-friendly** - No messing with `port 80`, `/etc/hosts`, `sudo` or additional software
- Fallback URL - `http://localhost:2000/project`
- Servers are only started when you access them
- Plays nice with other servers (Apache, Nginx, ...)
- Random or fixed ports

## Install

```sh
npm install -g chalet && chalet start
```

Chalet requires Node to be installed, if you don't have it, you can simply install it using one of the following method:

- https://github.com/creationix/nvm `nvm install stable`
- https://brew.sh `brew install node`

You can also visit https://nodejs.org.

## Quick start

### Local domains (optional)

To use local `.localhost` domains, you need to configure your network or browser to use chalet's proxy auto-config file or you can skip this step for the moment and go directly to http://localhost:2000

[**See instructions here**](https://github.com/jeansaad/chalet/blob/master/docs/README.md).

### Add your servers

```sh
# Add your server to chalet
~/projects/one$ chalet add 'npm start'
# Or start your server in the terminal as usual and get a temporary local domain
~/projects/two$ chalet run 'npm start'
```

Visit [localhost:2000](http://localhost:2000) or [http(s)://chalet.localhost](http://chalet.localhost).

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
chalet add 'ember server'                               # Ember
chalet add 'jekyll serve --port $PORT'                  # Jekyll
chalet add 'rails server -p $PORT -b 127.0.0.1'         # Rails
chalet add 'python -m SimpleHTTPServer $PORT'           # static file server (Python)
chalet add 'php -S 127.0.0.1:$PORT'                     # PHP
chalet add 'docker-compose up'                          # docker-compose
chalet add 'python manage.py runserver 127.0.0.1:$PORT' # Django
# ...
```

On **Windows** use `"%PORT%"` instead of `'$PORT'`

[**See a Docker example here.**](https://github.com/jeansaad/chalet/blob/master/docs/Docker.md).

### Proxy requests to remote servers

Add your remote servers

```sh
~$ chalet add http://192.168.1.12:1337 --name aliased-address
~$ chalet add http://google.com --name aliased-domain
```

You can now access them using

```sh
http://aliased-address.localhost # will proxy requests to http://192.168.1.12:1337
http://aliased-domain.localhost # will proxy requests to http://google.com
```

## CLI usage and options

```sh
chalet add <cmd|url> [opts]
chalet run <cmd> [opts]

# Examples

chalet add 'nodemon app.js' --out dev.log  # Set output file (default: none)
chalet add 'nodemon app.js' --name name    # Set custom name (default: current dir name)
chalet add 'nodemon app.js' --port 3000    # Set a fixed port (default: random port)
chalet add 'nodemon app.js' --env PATH     # Store PATH environment variable in server config
chalet add http://192.168.1.10 --name app  # map local domain to URL

chalet run 'nodemon app.js'                # Run server and get a temporary local domain

# Other commands

chalet ls     # List servers
chalet rm     # Remove server
chalet start  # Start chalet daemon
chalet stop   # Stop chalet daemon
```

To get help

```sh
chalet --help
chalet --help <cmd>
```

## Port

For `chalet` to work, your servers need to listen on the PORT environment variable.
Here are some examples showing how you can do it from your code or the command-line:

```js
var port = process.env.PORT || 3000;
server.listen(port);
```

```sh
chalet add 'cmd -p $PORT'  # OS X, Linux
chalet add "cmd -p %PORT%" # Windows
```

## Fallback URL

If you're offline or can't configure your browser to use `.localhost` domains, you can **always** access your local servers by going to [localhost:2000](http://localhost:2000).

## Configurations, logs and self-signed SSL certificate

You can find chalet related files in `~/.chalet` :

```sh
~/.chalet/conf.json
~/.chalet/daemon.log
~/.chalet/daemon.pid
~/.chalet/key.pem
~/.chalet/cert.pem
~/.chalet/servers/<app-name>.json
```

By default, `chalet` uses the following configuration values:

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

To override a value, simply add it to `~/.chalet/conf.json` and run `chalet stop && chalet start`

## Third-party tools

- [Hotelier](https://github.com/macav/hotelier) Hotelier (Mac & Windows Tray App)
- [Hotel Clerk](https://github.com/therealklanni/hotel-clerk) OS X menubar
- [HotelX](https://github.com/djyde/HotelX) Another OS X menubar (only 1.6MB)
- [alfred-hotel](https://github.com/exah/alfred-hotel) Alfred 3 workflow
- [Hotel Manager](https://github.com/hardpixel/hotel-manager) Gnome Shell extension

## FAQ

#### Setting a fixed port

```sh
chalet add --port 3000 'server-cmd $PORT'
```

#### Adding `X-Forwarded-*` headers to requests

```sh
chalet add --xfwd 'server-cmd'
```

#### Setting `HTTP_PROXY` env

Use `--http-proxy-env` flag when adding your server or edit your server configuration in `~/.chalet/servers`

```sh
chalet add --http-proxy-env 'server-cmd'
```

#### Proxying requests to a remote `https` server

```sh
chalet add --change-origin 'https://jsonplaceholder.typicode.com'
```

_When proxying to a `https` server, you may get an error because your `.localhost` domain doesn't match the host defined in the server certificate. With this flag, `host` header is changed to match the target URL._

#### `ENOSPC` and `EACCES` errors

If you're seeing one of these errors in `~/.chalet/daemon.log`, this usually means that there's some permissions issues. `chalet` daemon should be started without `sudo` and `~/.chalet` should belong to `$USER`.

```sh
# to fix permissions
sudo chown -R $USER: $HOME/.chalet
```

See also, https://docs.npmjs.com/getting-started/fixing-npm-permissions

#### Configuring a network proxy IP

If you're behind a corporate proxy, replace `"proxy"` with your network proxy IP in `~/.chalet/conf.json`. For example:

```json
{
  "proxy": "1.2.3.4:5000"
}
```

## License

MIT
