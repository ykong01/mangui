### [back](../README.md)

# Getting Started

## Clone repository

```sh
git clone git@github.com:Prime1Code/mangui.git
cd mangui
```

## Local dev environment without Docker

Build the React app and Spring Boot app. <br>
`gradle` and `npm` are required to run the build-script.

```sh
./buildBackendAndFrontend.sh
```

Afterwards:<br>

* `Start` your `Spring Boot` app with Spring Boot profile `spring.profiles.active=dev`
* `Start` you `React` app and open url [localhost:3000/login](localhost:3000/login)

## And thats it! 🎉 Have fun with Mangui <img src="../screenshots/ManguiLogo.svg" width="16px"/>

### [back](../README.md)
