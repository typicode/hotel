# hotel [![](https://img.shields.io/travis/typicode/hotel.svg)](https://travis-ci.org/typicode/hotel) [![](https://badge.fury.io/js/hotel.svg)](https://www.npmjs.com/package/hotel)

Start, stop and access your local servers from the browser <3

__Install__

```bash
npm install -g hotel
```

__Add your servers commands__ (need to be done only once)

```bash
~/express$ hotel add nodemon
~/static$ hotel add 'serve -p $PORT'
```

Your servers can now be accessed, started and stopped from [localhost:2000](http://localhost:2000).

As a shortcut, you can also directly go to `localhost:2000/<app-name>` to start and access a server. For example:

```
http://localhost:2000/express
http://localhost:2000/static
```

Works on OS X, Linux and Windows.

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

## PORT

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
