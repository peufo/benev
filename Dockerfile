FROM oven/bun:latest
RUN apt-get update -y
RUN apt-get install -y openssl
COPY . /app
WORKDIR /app
RUN bun install
# `.git` est hors du contexte de build: le sha du commit déployé doit entrer par ici.
# Absent, `svelte.config.js` retombe sur `dev`.
ARG BUILD_COMMIT
ENV BUILD_COMMIT=$BUILD_COMMIT
RUN bun run build
EXPOSE 3000/tcp
CMD [ "bun", "start" ]