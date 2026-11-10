FROM node:24-alpine
WORKDIR /srv/horizon-studio
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm test
ENV NODE_ENV=production PORT=3000 HORIZON_LEGACY_WORKER_EXPLICIT_OPT_IN=false
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
