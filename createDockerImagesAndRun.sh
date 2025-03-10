# backend (name != local, because gh action secret)
cd mangui/be
docker build -t mangui-backend .
# frontend (name != local, because gh action secret)
cd ../nginx_fe
docker build -t mangui-frontend .
# upload tags
docker tag mangui-frontend:latest prime1docker/mangui-frontend:latest
docker push prime1docker/mangui-frontend:latest
docker tag mangui-backend:latest prime1docker/mangui-backend:latest
docker push prime1docker/mangui-backend:latest
# docker restart
cd ..
docker compose stop
docker compose -f docker-compose-server.yml up --force-recreate -d