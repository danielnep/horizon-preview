FROM node:22-alpine
WORKDIR /app
COPY horizon-fluxo/package.json horizon-fluxo/server.mjs ./
COPY horizon-fluxo/public ./public
RUN mkdir -p /data
ENV NODE_ENV=production PORT=3050 DB_PATH=/data/fluxo.sqlite
EXPOSE 3050
CMD ["npm","start"]
