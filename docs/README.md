# Configuring local .dev domains

_This step is totally optional and you can use hotel without it._

To use local `.dev` domain, you need to configure your browser or network to use hotel's proxy auto-config file which is available at `http://localhost:2000/proxy.pac` [[view file content](../src/daemon/views/proxy-pac.js)].

After that, you'll be able to access servers using `.dev` domains:

* `http://hotel.dev  ` <-> `http://localhost:2000`
* `http://project.dev` <-> `http://localhost:2000/project`

You can also edit `~/.hotel/conf.json` to use another Top-level Domain. For example `.test`:

```json
{
  "tld": "test"
}
```

Don't forget to restart hotel and reload network or browser configuration.

## Subdomains

If you wish your app to be accessible via arbitrary subdomains, e.g. `http://www.project.dev` in addition to `http://project.dev`, use the `-w` argument to `hotel add`:

```
hotel add 'nodemon app.js' -w
```

## System configuration (recommended)

##### OS X

`Network Preferences > Advanced > Proxies > Automatic Proxy Configuration`

##### Windows

`Settings > Network and Internet > Proxy > Use setup script

##### Linux

Check your network manager and look for proxy configuration. Use browser configuration as an alternative.

## Browser configuration

Browsers can be configured to use a specific proxy. Use this method as an alternative to system-wide configuration.

##### Chrome

```sh
# Linux
google-chrome --proxy-pac-url=http://localhost:2000/proxy.pac

# OS X
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --proxy-pac-url=http://localhost:2000/proxy.pac 
```

__Note__ Exit Chrome before running these commands.

##### Firefox

`Preferences > Advanced > Network > Connection > Settings > Automatic proxy URL configuration`

##### Internet Explorer

Uses system network configuration.

## Troubleshooting

Make sure that you have started `hotel` and that `http://localhost:2000/proxy.pac` is available when setting proxy auto-config URL.
