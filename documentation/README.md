### [back](../README.md)

# Getting Started

## Clone repository

```sh
git clone git@github.com:Prime1Code/mangui.git
cd mangui
```

## Local Dev Environment without Docker

Build the React app and Spring Boot app. <br>
`gradle` and `npm` are required to run the build-script.
```sh
./buildBackendAndFrontend.sh
```

Afterwards:<br>

* `Start` your `Spring Boot` app with Spring Boot profile `spring.profiles.active=dev`
* `Start` you `React` app and open url [localhost:3000/login](localhost:3000/login)

## Dev environment with Docker

Just start the `script` below. It builds the artifacts and creates a `Docker environment` with

* `mongo` database
* `backend` app
* `frontend` web app
* `nginx-proxy`

```sh
./createDockerImagesAndRunLocally.sh
```

Head over to [localhost/login](localhost/login) and use username and password from the `.env`
file (`MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`). <br>

> [!NOTE]  
> Default value for username and password is `admin`

## Server environment with Docker
Create a directory for your Mangui app.
```sh
mkdir mangui
cd mangui
```

### Using pre-built Docker images

Create a folder structure like this. <br>
The project comes with all the `necessary` files in the corresponding folders.

```
├── mangui
│  ├── certs
│  ├── conf
│  │   └── client_max_body_size.conf
│  ├── Docker-compose-server-hub.yml
│  ├── .env
│  ├── vhost
│  │   ├── default
│  │   └── <vhost>_location
```

Start your Mangui app with the following CLI command
```sh
Docker-compose -f Docker-compose-server-hub.yml up --force-recreate -d
```

#### And thats it! 🎉 Have fun with Mangui <img src="../screenshots/ManguiLogo.svg" width="16px"/>


### Using frontend and backend build artifcats

In case you are building your own `frontend` and `backend` artifacts and do not want to use the pre-built Docker images, follow the instructions below:<br>

The server script `createDockerImagesAndRun.sh` requires the `frontend` and `backend` artifacts as well es
required `config files` in certain directories.<br>
Create a folder structure that looks like this:

```
├── createDockerImagesAndRun.sh
├── mangui
│   ├── be
│   │   ├── build
│   │   │   └── libs
│   │   │       └── mongodb.jar
│   │   └── Dockerfile
│   ├── certs
│   ├── conf
│   │   └── client_max_body_size.conf
│   ├── Docker-compose-server.yml
│   ├── .env
│   ├── nginx_fe
│   │   ├── build
│   │   │   ├── asset-manifest.json
│   │   │   ├── favicon.png
│   │   │   ├── index.html
│   │   │   ├── ManguiLogo.png
│   │   │   ├── ManguiLogo.svg
│   │   │   ├── manifest.json
│   │   │   ├── robots.txt
│   │   │   └── static
│   │   │       ├── css
│   │   │       │   ├── main.32752f7b.css
│   │   │       │   ├── main.32752f7b.css.map
│   │   │       └── js
│   │   │           ├── main.3ca5aa77.js
│   │   │           ├── main.3ca5aa77.js.LICENSE.txt
│   │   │           ├── main.3ca5aa77.js.map
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   ├── vhost
│   │   ├── default
│   │   └── <vhost>_location
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
> The size has to match the value `MANGUI_MAX_FILE_SIZE` in the `Docker-compose-server.yml` file (see below).


Edit the `.env` file to configure the necessary properties for the backend app and containers.<br>

```sh
nano .env
```

`Optionally` edit the `Docker-compose-server.yml` file to configure volumes or ports if needed.
<details>
  <summary><strong>Optional</strong></summary>

```sh
nano Docker-compose-server.yml
```

</details>

### Final step

```sh
./createDockerImagesAndRun.sh
```

#### And thats it! 🎉 Have fun with Mangui <img src="../screenshots/ManguiLogo.svg" width="16px"/>

### [back](../README.md)