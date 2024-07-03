# Fri3d IRA web interface

## How to run the web interface

### With Node.js

1. Install the dependencies:

```bash
npm install
```

2. Run the web interface:

```bash
npm run build
npm run preview
```

### With Docker

There is a Dockerfile supplied. You can start this easily with the `docker-compose.yml` file in the `docker` directory.

1. Build the Docker image:

```bash
cd docker
docker compose build
```

2. Run the Docker container:

```bash
docker compose up
```

## Development

The project is setup with Vite, React and Typescript. It uses (Tailwind CSS)[https://tailwindcss.com/] for styling and uses [Nats.ws](https://github.com/nats-io/nats.ws) to communicate with the NATS server.

Run a dev server with

```bash
npm run dev
```
