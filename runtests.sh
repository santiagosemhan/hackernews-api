#!/bin/sh

export COMPOSE_PROJECT_NAME=test

# Clean up environment
docker compose -f ./test/docker-compose.yml stop
docker compose -f ./test/docker-compose.yml rm -f

# Get the list of dangling containers
dangling_containers=$(docker ps -aq --no-trunc)

# Remove dangling containers if there are any
for container in "${dangling_containers}"
do
	if [ "${container}" == "" ]; then
		break
	fi
	docker stop $(docker ps -aq --no-trunc) && docker rm $(docker ps -aq --no-trunc)
done

# Create and Start containers in detached mode(Run containers in the background).Build services, no cache.
docker compose -f ./test/docker-compose.yml up -d --build
RET=$?
if [ $RET -ne 0 ]; then
  exit $RET
fi

# View output from containers
docker compose -f ./test/docker-compose.yml logs -f app

# List containers with only IDs
docker compose -f ./test/docker-compose.yml ps -q app | xargs docker inspect -f '{{ .State.ExitCode }}' | grep -sq "^0$"
RET=$?

# Stops containers and removes containers, networks, volumes, and images created by up.
docker compose -f ./test/docker-compose.yml down -v

# exit with the code from the docker-compose command
exit $RET
