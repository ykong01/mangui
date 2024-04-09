### [back](../README.md)

# Getting Started

## Clone repository

```sh
git clone git@github.com:Prime1Code/mongodb-ui.git
cd mongodb-ui
```

## Dev environment without docker

Build the React app and Spring Boot app separately with your IDE of choice. Afterwards:<br>

* `Start` your `Spring Boot` app with Spring Boot profile `spring.profiles.active=dev`
* `Start` you `React` app and open url [localhost:3000/login](localhost:3000/login)

## Dev environment with docker

Just start the `script` below. It builds the artifacts and creates a `docker environment` with

* `mongo` database
* `backend` app
* `frontend` web app
* `nginx-proxy`

```sh
./createDockerImagesAndRunLocally.sh
```

Head over to [localhost/login](localhost/login) and use username and password from the `.env`
file (`MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`)

## Server environment with docker

The server script `createDockerImagesAndRun.sh` requires the `frontend` and `backend` artifacts as well es
required `config files` in certain directories.<br>
The default folder structure looks like this:

```
├── be
│   ├── build
│   │   └── libs
│   │       └── mongodb.jar
│   └── dockerfile
├── certs
├── docker-compose.yml
├── nginx_fe
│   ├── build
│   │   ├── asset-manifest.json
│   │   ├── favicon.png
│   │   ├── index.html
│   │   ├── ManguiLogo.png
│   │   ├── ManguiLogo.svg
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── static
│   │       ├── css
│   │       │   ├── main.32752f7b.css
│   │       │   ├── main.32752f7b.css.map
│   │       └── js
│   │           ├── main.3ca5aa77.js
│   │           ├── main.3ca5aa77.js.LICENSE.txt
│   │           ├── main.3ca5aa77.js.map
│   ├── dockerfile
│   └── nginx.conf
└── vhost
│   ├── default
│   └── <vhost>_location
└── conf
    └── client_max_body_size.conf
```

<details>
  <summary><strong>If you want to change the folder structure</strong></summary>

```sh
nano createDockerImagesAndRun.sh
```

</details>

> [!IMPORTANT]  
> You have to rename the `<vhost>_location` file to your `MANGUI_VHOST` or `VIRTUAL_HOST` value.
> It contains the proxy cookie path to ensure transfer of cookies between frontend and backend.

> [!NOTE]  
> Edit the `client_max_body_size.conf` file to set the max upload size for file imports via the web app.
> The size has to match the value `MANGUI_MAX_FILE_SIZE` in the `docker-compose-server.yml` file (see below).

Check the file below and change directories if needed.<br>
Edit the `.env` file to configure the necessary properties for the backend app and containers.<br>
Optionally edit the `docker-compose-server.yml` file to configure volumes or ports if needed.

```sh
nano .env
```

<details>
  <summary><strong>Optional</strong></summary>

```sh
nano docker-compose-server.yml
```

</details>

```sh
./createDockerImagesAndRun.sh
```

# And thats it! 🎉 Have fun with Mangui <img src="../screenshots/ManguiLogo.svg" width="4%"/>

### [back](../README.md)