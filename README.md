
---

# Real-Time Weather Monitoring System

This project is a real-time weather monitoring system that retrieves and analyzes weather data using the OpenWeatherMap API. It provides rollups, aggregates, and threshold-based alerts, and displays weather summaries for several cities in India.

## Features

- Fetches real-time weather data every 5 minutes for specified cities.
- Provides daily weather summaries, including average, minimum, and maximum temperatures, and dominant weather conditions.
- Sends alerts when user-defined thresholds (e.g., temperature above 35°C) are breached.
- Stores data and summaries in PostgreSQL.
- Displays historical weather trends and summaries using EJS templates.

---

## Build Instructions

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v12.x or later) - [Node.js installation](https://nodejs.org/)
- **PostgreSQL** (v12.x or later) - [PostgreSQL installation](https://www.postgresql.org/download/)
- **OpenWeatherMap API Key** - Sign up for a free key [here](https://openweathermap.org/appid).

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### Step 2: Install Dependencies

Run the following command to install the necessary Node.js dependencies:

```bash
npm install
```

### Step 3: Set Up PostgreSQL Database

Ensure PostgreSQL is running. Create the required database and tables:

1. Log in to PostgreSQL:
   ```bash
   psql -U postgres
   ```
2. Create the database:
   ```sql
   CREATE DATABASE rule_engine_db;
   ```
3. Create the tables:
   ```sql
   CREATE TABLE weather_updates (
     id SERIAL PRIMARY KEY,
     city VARCHAR(50),
     main VARCHAR(50),
     description VARCHAR(255),
     temp DECIMAL,
     feels_like DECIMAL,
     humidity INTEGER,
     wind_speed DECIMAL,
     rain DECIMAL,
     dt TIMESTAMP
   );

   CREATE TABLE daily_weather_summary (
     id SERIAL PRIMARY KEY,
     city VARCHAR(50),
     avg_temp DECIMAL,
     max_temp DECIMAL,
     min_temp DECIMAL,
     dominant_condition VARCHAR(50),
     summary_date DATE
   );
   ```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```bash
OPENWEATHER_API_KEY=your_openweather_api_key
DB_USER=postgres
DB_PASSWORD=123456
DB_HOST=localhost
DB_PORT=5000
DB_NAME=rule_engine_db
```

### Step 5: Running the Application

Start the server:

```bash
npm start
```

The app will run at `http://localhost:3000`. You can view weather summaries and monitor alerts.

---

## Dependencies

- **Node.js** - Server-side JavaScript runtime.
- **Express.js** - Web framework for Node.js.
- **EJS** - Template engine for rendering HTML pages.
- **Axios** - HTTP client for making API requests.
- **PostgreSQL** - Relational database for storing weather data.
- **node-cron** - Task scheduler for periodic API calls.

You can use Docker or Podman containers to run the PostgreSQL database, Node.js server, and web app if preferred.

---

## Docker Setup (Optional)

### Step 1: Create Docker Compose File

Here’s an example `docker-compose.yml` for setting up the PostgreSQL database and Node.js server:

```yaml
version: '3.8'
services:
  db:
    image: postgres:12
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: rule_engine_db
    ports:
      - "5000:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENWEATHER_API_KEY=your_openweather_api_key
      - DB_USER=postgres
      - DB_PASSWORD=123456
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=rule_engine_db
    depends_on:
      - db

volumes:
  db_data:
```

### Step 2: Run Docker Compose

```bash
docker-compose up --build
```

This will start both the PostgreSQL database and the Node.js app in Docker containers.

---

## Design Choices

- **Node.js and Express**: Chosen for their simplicity and performance in handling asynchronous API calls.
- **PostgreSQL**: Used as the database for its ACID properties and robust SQL support, especially for aggregates and rollups.
- **EJS**: Lightweight and easy-to-use template engine for rendering weather summaries on the front-end.
- **node-cron**: Schedules periodic tasks such as fetching weather data every 5 minutes and calculating daily summaries at midnight.
- **Axios**: Makes API requests in a promise-based manner, simplifying error handling and response parsing.

---

## Testing

To run the following tests, ensure your system is set up correctly:

1. **System Setup Test**: Check if the app connects to OpenWeatherMap API and PostgreSQL correctly.
2. **Data Retrieval Test**: Simulate API calls at intervals to ensure proper data parsing.
3. **Temperature Conversion Test**: Verify temperature is correctly converted from Kelvin to Celsius.
4. **Daily Summary Test**: Simulate weather data and verify daily rollups and summaries.
5. **Alert Test**: Set a temperature threshold and check if alerts trigger appropriately.

---
