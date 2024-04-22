# all artifacts are already built
# backend
cd mangui/be
docker build -t mangui-backend .
# frontend
cd ../nginx_fe
docker build -t mangui-frontend .
# docker restart
cd ..
docker-compose stop
docker-compose -f docker-compose-server.yml up --force-recreate -d