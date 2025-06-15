### [back](../../README.md)

# Getting Started

## Clone repository

```sh
git clone git@github.com:Prime1Code/mangui.git
cd mangui
```

## Server environment with Docker

Create a directory for your Mangui app.

```sh
mkdir mangui
cd mangui
```

### Using pre-built Docker images

Your folder structure should already look like this. <br>
The project comes with all the `necessary` files in the corresponding folders.

```
├── mangui
│  ├── certs
│  ├── conf
│  │   └── client_max_body_size.conf
│  ├── docker-compose-server-hub.yml
│  ├── .env
│  ├── vhost
│  │   ├── default
│  │   └── <vhost>_location
```

> [!NOTE]  
> Default value for username and password is `admin`

> [!IMPORTANT]  
> You have to rename the `<vhost>_location` file to your `MANGUI_VHOST` or `VIRTUAL_HOST` value.

> [!NOTE]  
> Edit the `client_max_body_size.conf` file to set the max upload size for file imports via the web app.
> The size has to match the value `MANGUI_MAX_FILE_SIZE` in the `docker-compose-server-hub.yml` file (see below).

> [!NOTE]  
> Change the default value of `MANGUI_JWT_SECRET_VALUE`, if your app runs in `production` mode

Edit the `.env` file to configure the necessary properties for the backend app and containers

`Optionally` edit the `docker-compose-server-hub.yml` file to configure volumes or ports if needed.

### Final step

Start your Mangui app with the following CLI command

```sh
docker compose -f docker-compose-server-hub.yml up --force-recreate -d
```

### Troubleshooting Connectivity to Your Mangui Instance

If you're experiencing issues connecting to your Mangui instance, consider the following checks:

- **Domain Configuration:** Verify that your subdomain is properly registered with your domain provider.
- **HTTPS Access:** Ensure that your Mangui frontend is accessible via HTTPS (e.g.,
  `https://subdomain.yourdomain.com/`).
- **MongoDB Port Mapping:** Confirm that the port mapping for your MongoDB container is correctly configured (e.g.,
  `127.0.0.1:27017->27018`).
- **Docker Network:** Make sure all containers are part of the same Docker network. By default, the setup script creates
  a network named `<directory>_mangui`. This network must be explicitly defined for each container in your
  `docker-compose-server-hub.yml` file.
- **Cookies:** Make sure, that your website connection is secured via HTTPS, otherwise cookies won't work, because they
  include the `Secure` attribute

## And thats it! 🎉 Have fun with Mangui <img src="../screenshots/ManguiLogo.svg" width="16px"/>

### [back](../../README.md)
