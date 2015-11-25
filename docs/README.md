## Dev domain support

This step is totally optional and you can use `hotel` without it.

To use local `.dev` domain, you need to configure your browser or network to use `hotel`'s proxy auto-config file which is available at `http://localhost:2000/proxy.pac` (view [proxy.pac](../src/daemon/proxy-pac.js) content).

After that, you'll be able to access servers using `.dev` domains:

* `http://hotel.dev  ` <-> `http://localhost:2000`
* `http://project.dev` <-> `http://localhost:2000/project`

### Browser configuration

* Firefox - `Preferences > Advanced > Network > Connection > Settings > Automatic proxy URL configuration`
* Chrome - `google-chrome --proxy-pac-url=http://localhost:2000/proxy.pac`
* Internet Explorer - uses system network configuration.

### System configuration

* OS X - `Network Preferences > Advanced > Proxies > Automatic Proxy Discovery`
* Windows - `Settings > Network and Internet > Proxy > Use setup script`
* Linux - depends on the distribution, use browser configuration as an alternative.

## Important

Make sure that you have started `hotel` and that `http://localhost:2000/proxy.pac` is available when setting proxy auto-config URL.
