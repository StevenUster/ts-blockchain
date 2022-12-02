docker build -t blockchain-frontend ./frontend
docker build -t blockchain-backend ./backend

docker run -d --restart on-failure:5 -p 80:80 blockchain-frontend
docker run -d --restart on-failure:5 -p 3000:3000 blockchain-backend