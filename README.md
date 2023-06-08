# Hacker news API

## Description
This app performs data ingestion from hacker news API and exposes some endpoints to query that data.
Also it runs a cron job for fetching data every 1 hour (prod) and 10 seconds (dev).

## How to Run it locally
You'll see a local folder at the root level. It contains a `docker-compose.yml` file that will run the app in a Docker container. It will spin up a mongoDB database and a Node.js server.

To run the app, follow these steps:

1. Install Docker: https://docs.docker.com/get-docker/
2. Clone the repo: `git clone ...`
3. Run `cd local`
4. Run the app: `docker compose up`

The app will start running on http://localhost:3000. The hot-reloading feature is enabled by default. Swagger is enabled by default as well. You can access it on http://localhost:3000/api/docs.

Automatically, it will start fetching the data from the hacker news API every 10 seconds (dev).

## Default user/password
You should grab a token from the `/auth/login` endpoint. The default user/password is `test/test`.

## How to run the prod version
A Dockerfile is provided at the root level. It will build a Docker image that can be deployed to any cloud provider. You should be responsible for setting up the database of your choice. The only requirement is that the `MONGO_URI` environment variable is set.

```sh
docker build -t applydigital-hn .
docker run -e MONGO_URI='mongodb://root:root@host.docker.internal:27017/hackernews?authSource=admin' applydigital-hn
```

## How to Test
The app provides a `runtests.sh` script that will run the tests inside a Docker container. This is a script that could be implemented in a CI/CD pipeline. It will run linting, unit tests, integration tests and code coverage.

1. Install Docker: https://docs.docker.com/get-docker/
2. Run the tests: `./runtests.sh`

## TODO List

Here's a list of things that need to be done in the future:

- Decouple the cron job from the server. It should be a separate service. (Or at least, be able to run the server without the cron job or viceversa - It could be an environment variable)
- Store each deletion in a separate collection. This will allow us to don't insert the same item if the cron job runs again and try to do it.
- Scheduling via cron job is not the best option. It would be better to use a message queue like RabbitMQ or Kafka.
- Authentication and authorization. The app is not secure at all. The user and password are hardcoded in the code. It should be stored in a database and encrypted.
- The JWT secret is hardcoded in the code. It should be stored in an environment variable.
