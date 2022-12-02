FROM node as builder

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY ./ /app/
RUN npm run build


FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/dist .
ENTRYPOINT ["nginx", "-g", "daemon off;"]

# docker build -t blockchain-frontend .
# docker run -d --restart on-failure:5 -p 80:80 blockchain-frontend