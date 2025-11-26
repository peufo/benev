FROM oven/bun:latest
RUN apt-get update -y
RUN apt-get install -y openssl
COPY . /app
WORKDIR /app
RUN bun install
RUN bun run build
EXPOSE 3000/tcp
CMD [ "bun", "start" ]