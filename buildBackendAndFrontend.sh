# backend
rm -rf build
./gradlew bootJar
# frontend
cd ./frontend
rm -rf build
npm install
npm run build