# hotel [![](https://img.shields.io/travis/typicode/hotel.svg)](https://travis-ci.org/typicode/hotel) [![](https://badge.fury.io/js/hotel.svg)](https://www.npmjs.com/package/hotel)

> Manage your dev servers from the browser without having to think about ports or commands <3

## Quick start

Add your servers commands (need to be done only once)

```bash
~/projects/one$ hotel add nodemon
~/projects/two$ hotel add 'serve -p $PORT'
```

Now, you can access, start and stop your servers from [localhost:2000](http://localhost:2000).

As a shortcut, you can also directly go to [localhost:2000/project-name](). For instance:

```bash
# http://localhost:2000/one
# http://localhost:2000/two
```

Works on OS X, Linux and Windows.

## Install

```bash
npm install -g hotel
```

If you install `hotel` using `sudo`, please run the following command `hotel autostart && hotel start` to complete installation.

## GIF

![](https://rawgit.com/typicode/hotel/master/screen.gif)

## Usage

To add a server

```bash
hotel add <cmd> cmd [opts]

# Examples:
hotel add nodemon -o out.log # Set output file
hotel add nodemon -n name    # Set custom name
hotel add nodemon -e ENV     # Save environment variable
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
hotel ls           # List servers
hotel rm [name]    # Remove server
hotel start        # Start daemon
hotel stop         # Stop daemon
hotel autostart    # Create autostart script
hotel rm-autostart # Remove autostart script
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

## License

MIT - [Typicode](https://github.com/typicode)
