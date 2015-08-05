# hotel [![](https://img.shields.io/travis/typicode/hotel.svg)](https://travis-ci.org/typicode/hotel) [![](https://badge.fury.io/js/hotel.svg)](https://www.npmjs.com/package/hotel)

Hotel is a simple process manager created for web developers.

1. Tell hotel how to start your server
2. Go to [localhost:2000]()
3. Congrats :+1:

![](https://rawgit.com/typicode/hotel/master/screen.gif)

_Works on OS X, Linux and Windows with any server._

## Why?

With hotel, you don't have to leave your browser to start your dev server. You also don't have to manage terminal tabs, remember commands, worry about ports, ...

Just fire up your text-editor, a browser and you're done.

## Install

```bash
npm install -g hotel && hotel start
```

## Quick start

Add your servers commands (need to be done only once).

```bash
~/projects/one$ hotel add nodemon
~/projects/two$ hotel add 'serve -p $PORT'
```

Now, you can access, start and stop your servers from [localhost:2000](http://localhost:2000).

As a shortcut, you can also directly go to:

```bash
http://localhost:2000/one
http://localhost:2000/two
```

Other servers examples (on Windows use `""` and `%PORT%`):

```bash
hotel add 'jekyll --port $PORT'
hotel add 'rails server --port $PORT'
hotel add 'python -m SimpleHTTPServer $PORT'
hotel add 'php -S 127.0.0.1:$PORT'
# ...
```

## Usage

To add a server

```bash
hotel add <cmd> [opts]

# Examples:
hotel add 'nodemon app.js' -o out.log # Set output file (default: none)
hotel add 'nodemon app.js' -n name    # Set custom name (default: current dir name)
hotel add 'nodemon app.js' -p 3000    # Set a fixed port (default: random port)
hotel add 'nodemon app.js' -e ENV     # Save environment variable
```

To list, start and stop servers go to

```
http://localhost:2000
```

To start and access directly your server go to

```
http://localhost:2000/<app-name>
```

Other commands

```bash
hotel ls        # List servers
hotel rm [name] # Remove server
hotel start     # Start daemon
hotel stop      # Stop daemon
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

## Files

`~/.hotel` contains daemon log, servers and daemon configurations.

```bash
~/.hotel/conf.json
~/.hotel/daemon.log
~/.hotel/servers/<app-name>.json
```

## Third-party tools

[Hotel Clerk](https://github.com/therealklanni/hotel-clerk) OS X menubar

## License

MIT - [Typicode](https://github.com/typicode)
