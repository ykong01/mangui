#docker login
docker tag mangui-frontend:latest prime1docker/mangui-frontend:latest
docker push prime1docker/mangui-frontend:latest
docker tag mangui-backend:latest prime1docker/mangui-backend:latest
docker push prime1docker/mangui-backend:latest