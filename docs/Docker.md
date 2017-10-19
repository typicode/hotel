# Docker

[Docker](https://www.docker.com/) is a software container platform that integrates easily into Hotel.

### Dockerfile

A [Dockerfile](https://docs.docker.com/engine/reference/builder/) is used to create a single container. Here is an example:

```
FROM httpd:2.4
COPY ./public-html/ /usr/local/apache2/htdocs/
```

To build this image, run the following in the application directory:

```
docker build -t my-apache2 .
```

To use Hotel for this example, run the following in the application directory:

```
hotel add 'docker run -dit --name my-running-app my-apache2'
```

### Docker Compose

[Compose](https://docs.docker.com/compose/) is a tool for defining and running multi-container Docker applications. Here is a simple example:

```
version: '3'
services:
  web:
    build: .
    ports:
     - "5000:5000"
```

This binds the internal port 5000 on the container to port 5000 on the host machine. To build this image, run the following:

`docker-compose build`

To use Hotel for this, run the following in the application directory:

```
hotel add 'docker-compose up' -p 5000
```
