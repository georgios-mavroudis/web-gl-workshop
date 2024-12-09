FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--", "--host"]