# Chaitanya Inc. Website Backend API

## Overview

This is the backend API for Chaitanya Inc.'s website. It provides RESTful endpoints for handling user registration, client management, carrier operations, contact creation, and change log tracking.

## Setup

1. Clone this repository to your local machine.
2. Install dependencies using `npm install`.
3. Create a `.env` file in the root directory and define the necessary environment variables. You can use the `.env.example` file as a template.
4. Run the application using `npm start`.

## Dependencies

- Express.js: Web application framework for Node.js
- dotenv: Loads environment variables from a `.env` file
- helmet: Helps secure Express apps by setting various HTTP headers
- express-rate-limit: Middleware to limit repeated requests to public APIs
- Other project-specific dependencies

## Project Structure

- `controllers/`: Contains controller functions for handling different routes and business logic.
- `Security/`: Contains security-related middleware and utilities.
- `app.js`: Main entry point of the application.
- Other project files and directories.

## Available Routes

- `GET /`: Home route.
- `POST /addUser`: Register a new user.
- `GET /user/:id`: Get user details by ID.
- `PUT /user/:id`: Update user details by ID.
- `DELETE /user/:id`: Delete user by ID.
- `POST /carrier/create`: Create a new carrier.
- `GET /carrier/:id`: Get carrier details by ID.
- `POST /changeLogs/create`: Create a new change log entry.
- `GET /changeLogs/:id`: Get change log details by ID.
- `POST /client/create`: Create a new client.
- `GET /client/:id`: Get client details by ID.
- `POST /contact/create`: Create a new contact.

## Middleware

- `express.json()`: Middleware to parse JSON request bodies.
- `helmet()`: Middleware to set various HTTP headers for security.
- `logger`: Custom middleware for logging requests.
- `errorHandler`: Custom error handling middleware.
- `rateLimit`: Rate limiting middleware to prevent abuse of public APIs.
- `measureRequestDuration`: Middleware to measure request duration for monitoring purposes.
- `exposeMetrics`: Endpoint to expose application metrics.

## Environment Variables

Make sure to set the following environment variables:

- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase authentication domain
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID
- `JWT_SECRET`: Secret key for JWT token generation

## Contributing

This project is the backend API for Chaitanya Inc.'s website and is maintained internally by the development team. Contributions are limited to internal team members only. For any inquiries or suggestions, please contact the project maintainers within Chaitanya Inc.
