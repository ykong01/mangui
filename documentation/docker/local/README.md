### [back](../README.md)

# Getting Started

## Clone repository

```sh
git clone git@github.com:Prime1Code/mangui.git
cd mangui
```

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

> [!NOTE]  
> Change the default value of `MANGUI_JWT_SECRET_VALUE`, if your app runs in `production` mode

## Pre-Built Docker images

If you want to use pre-built Docker images, then replace this line inside `./createDockerImagesAndRunLocally`

```sh
docker-compose -f docker-compose-local.yml up --force-recreate -d
```

with

```sh
docker-compose -f docker-compose-local-hub.yml up --force-recreate -d
```

## And thats it! 🎉 Have fun with Mangui <img src="../screenshots/ManguiLogo.svg" width="16px"/>

### [back](../README.md)
