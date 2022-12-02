FROM node:16.15.0-slim

RUN mkdir -p /app
ENV PORT 3000

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]

# docker build -t blockchain-backend .
# docker run -d --restart on-failure:5 -p 3000:3000 blockchain-backend