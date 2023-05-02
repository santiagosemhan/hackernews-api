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

# Create database service as detached
docker compose -f ./test/docker-compose.yml up -d --build mongodb
RET=$?
if [ $RET -ne 0 ]; then
  exit $RET
fi

# Wait for the mongodb container to be ready
while true; do
  if docker compose -f ./test/docker-compose.yml exec mongodb mongosh --eval "printjson(db.adminCommand('ping'))" | grep "ok" >/dev/null; then
    echo "MongoDB is up and running!"
    break
  else
    echo "Waiting for MongoDB to start..."
    sleep 1
  fi
done


echo "Starting app container and waiting for it to finish"
docker compose -f ./test/docker-compose.yml up --build app --exit-code-from app
RET=$?

# Stops and removes containers, networks, volumes, and images created by up.
docker compose -f ./test/docker-compose.yml down -v

# exit with the code from the docker-compose command
exit $RET
