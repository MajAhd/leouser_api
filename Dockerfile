FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install --no-install-recommends -qq -y \
    ca-certificates \
    iputils-ping \
    jq \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000
EXPOSE 9200


CMD ["npm", "run", "dev"]