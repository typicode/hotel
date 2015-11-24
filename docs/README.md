## Dev domain support

This step is totally optional and you can use `hotel` without it.

To use local `.dev` domain, you need to configure your browser or network to use `hotel`'s proxy auto-config file which is available at `http://localhost:2000/proxy.pac` (view [proxy.pac](../src/daemon/proxy-pac.js) content).

After that, you'll be able to access servers using `.dev` domains:

* `http://hotel.dev  ` <-> `http://localhost:2000`
* `http://project.dev` <-> `http://localhost:2000/project`

### Browser configuration

* __Firefox__ `Preferences > Advanced > Network > Connection > Settings > Automatic proxy URL configuration`
* __Chrome__ `google-chrome --proxy-pac-url=http://localhost:2000/proxy.pac`
* __Internet Explorer__ uses system network configuration.

### System configuration

* __OS X__ `Network Preferences > Advanced > Proxies > Automatic Proxy Discovery`
* __Windows__ `Settings > Network and Internet > Proxy > Use setup script`
* __Linux__ depends on the distribution, use browser configuration as an alternative.
