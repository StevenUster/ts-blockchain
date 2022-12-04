docker stop blockchain-frontend
docker stop blockchain-backend

docker container prune -f
docker image prune -f

docker build -t blockchain-frontend ./frontend
docker build -t blockchain-backend ./backend

docker run -d --name blockchain-frontend --restart on-failure:5 -p 80:80 blockchain-frontend
docker run -d --name blockchain-backend --restart on-failure:5 -p 3000:3000 blockchain-backend

docker logs -f blockchain-backend