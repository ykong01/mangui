# backend
rm -rf build
./gradlew bootJar
docker build -t mangui-backend .
# frontend
cd ./frontend
rm -rf build
npm install
npm run build
docker build -t mangui-frontend .
# docker restart
cd ..
docker-compose stop
docker-compose -f docker-compose-local.yml up --force-recreate -d