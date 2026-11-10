FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY central ./central
COPY maestro ./maestro
COPY server.mjs ./
EXPOSE 3000
CMD ["node","server.mjs"]
