FROM node:23

WORKDIR /app
COPY package.json /app
RUN npm install

COPY . .

EXPOSE 5173
CMD npx vite serve --port 5173 --host 0.0.0.0
