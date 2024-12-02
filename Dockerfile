FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN yarn 

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]