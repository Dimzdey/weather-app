
# Node.js & PostgreSQL Dockerized Application

This project is a Dockerized Node.js application connected to a PostgreSQL database. It's set up to ensure data persistence for the database and streamlined deployment of the Node.js server.

## Getting Started

These instructions will cover usage information and how to get the project up and running.

### Prerequisites

You'll need Docker and Docker Compose installed on your system to use this application. You can download and install Docker [here](https://docs.docker.com/get-docker/) and find Docker Compose installation instructions [here](https://docs.docker.com/compose/install/).

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://your-repository-url.git
   cd your-repository-name
   ```

2. **Set Up Environment Variables**

   Create a `.env` file in the project root. Update it with your environment-specific values:

   ```env
   # PostgreSQL Environment Variables
   POSTGRES_HOST="postgres"
   POSTGRES_PORT="5432"
   POSTGRES_DB="pg"
   POSTGRES_USER="pg"
   POSTGRES_PASSWORD="pass"
   DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"


   # OpenWeather Environment Variables
   OPEN_WEATHER_API_KEY=your_open_weather_api_key
   OPEN_WEATHER_API_URL=https://api.openweathermap.org/data/3.0/onecall

   # Node.js Environment Variables
   # Add any other environment variables your app requires
   PORT=3000
   NODE_ENV=development
   ```

3. **Building and Running the Application**

   Use Docker Compose to build and run your application:

   ```bash
   docker-compose up --build
   ```

   This command will start the Node.js application and the PostgreSQL service.

### Usage

After starting the application, you can access:

- The Node.js application at: `http://localhost:$PORT`
- The PostgreSQL database on port `5432`

### Development

To run the application in development mode, you can use the following command:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This command will start the Node.js application in development mode, which will enable hot-reloading and other development features.
After starting the application, you need to sync the database schema with the following command:

```bash
pnpm run prisma-dev:push
```

Make sure to install the dependencies before running the application:

```bash
npm i -g pnpm
npm i -g dotenv-cli
pnpm install
```

### Additional Commands

- To stop the application:

  ```bash
  docker-compose down
  ```

- To remove the volumes and start fresh:

  ```bash
  docker-compose down -v
  ```
