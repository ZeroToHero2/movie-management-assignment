<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# 🎬 Movie Management API

Welcome to the Movie Management API - your ultimate solution for digital cinema operations! Built with NestJS and powered by cutting-edge technologies, this robust backend application orchestrates everything from movie listings to ticket sales with enterprise-grade reliability.

## 🌟 Core Architecture
- 🏗️ Built on NestJS framework
- 🎯 Domain-Driven Design (DDD) principles
- 💾 PostgreSQL for rock-solid data persistence
- 🔄 Advanced transaction management
- 🌐 RESTful API design

## ✨ Key Features

### 🔐 User Management
Fortress-level security with:
- AES-256 encrypted token payloads
- Role-Based Access Control (RBAC)
- Bulletproof authentication system

### 🎥 Movie Management
Complete control over your cinema's lineup:
- Create & update movie listings
- Bulk operations support
- Smart session management
- Detailed movie information

### ⏰ Session Management
Flexible scheduling made easy:
- Add/remove screening times
- Conflict detection
- Room allocation
- Real-time availability

### 🎟️ Ticketing System
Seamless ticket operations:
- Quick purchase flow
- Digital ticket management
- Watch history tracking
- Session validation

### 📧 Smart Notifications
Modern communication system:
- Automated email confirmations
- QR code ticket generation
- Instant purchase notifications
- Digital entry validation


# 📦 What's Inside The Box?
- #### `🚀 Swagger Documentation`
    - 🎯 Don't talk, give me the swagger ✋! Dive into our comprehensive `Swagger Documentation` - your one-stop shop for exploring all the API endpoints, complete with example requests and responses. It's like having a GPS for the Movie Management API! 🗺️

    ![Swagger](./assets/all-endpoints.png)

# Sample Application Showcase
- #### 🏥 `Health Check` Routes
    - 🔍 Robust health monitoring system with readiness and liveness probes
    - 🚦 Real-time application status monitoring in containerized environments
    - 🔄 Automatic traffic management and container orchestration
    - 🛡️ Proactive pod restart on health check failures

    ![Health](./assets/health-endpoints.png)

- #### 🔐 `User Login`
 - Users (Managers and Customers) can login using this endpoint with their email and password.

    ![Check Outdated Dependencies](./assets/login-as-manager.png)

- #### 👥 `User Registration`
- Users can register using this endpoint with their email, username, password, and age.
- The endpoint validates the input data and checks for existing users with the same email.
- If validation passes, a new user is created with the `CUSTOMER` role.
- A JWT token is generated and returned along with the user details.
- Note: This endpoint is for customer registration only. Managers must be created through the dedicated manager creation endpoint.


    ![Register New User](./assets/user-signup.png)

- #### 👨‍💼 `Create Manager`
	- •	The manager sends a request with the details of the new manager to be created.
	- •	This endpoint can only be used by managers to create new one with`MANAGER` role .

    ![Create Manager](./assets/register-manager.png)

- #### 🧑‍💼 `User Profile`
	- •	The user sends a request to retrieve their profile information.
	- •	The endpoint fetches the user's details from the database and returns them.
	- •	A success message is returned along with the user's profile information, including username, email, age, and role.

    ![User Profile](./assets/user-profile.png)

- #### 📺 `Watch History`
    - •	The user sends a request to retrieve their movie watch history.
    - •	The endpoint returns a list of all movies the user has watched, including details like movie name, watch date, and session information.
    - •	This helps users track their viewing history and provides personalized recommendations.
    - Note:
    - •	This endpoint requires authentication to ensure users can only access their own watch history.

    ![User Watch History](./assets/watch-history.png)

- #### 🎬 `Bulk Add Movies`
  - The Bulk Add Movies endpoint allows authenticated managers to add multiple movies at once in a single transaction. This ensures that all movie additions either succeed together or fail together, maintaining data integrity. 
  - This endpoint is protected by the `@Roles(Role.MANAGER)` decorator, ensuring only users with the manager role can perform this action.

    ![Bulk Add Movies](./assets/bulk-add-movie.png)

- #### 📋 `List All Movies`
	- •	The endpoint allows everyone to retrieve a list of all active movies. Optional query parameters can be provided to filter and sort the results based on criteria like movie name, age restriction, or sorting order.
	- •	The request does not require any authentication, making it accessible to anyone.
	- •	The response returns a list of movies that match the provided filters.

    ![List All Movies Sorted By DESC Order](./assets/list-movies.png)

- #### 🎬 `Get Movie`
	- •	The user sends a request to retrieve movie details with its associated sessions by its ID.

    ![Get Movie](./assets/get-movie.png)

- #### ➕ `Create Movie`
	- •	The manager sends a request with the movie details, including any associated sessions.
	- •	The movie and its sessions are created within a single transaction to prevent conflicts, such as overlapping sessions in the same room. If a conflict or error occurs, the entire transaction is rolled back to ensure data consistency.

    ![Create Movie](./assets/create-movie.png)

- #### 📝 `Update Movie`
	- •	The manager sends a request with updated movie details, including any changes to associated sessions.
	- •	Before applying the updates, the endpoint checks if the new session details (date and time for room number) are available to avoid conflicts.
	- •	If the updates are valid, the movie and its sessions are updated accordingly. If there's a conflict, the update is rejected to maintain data integrity.

    ![Update Movie](./assets/update-movie.png)

- #### 🗑️ `Delete Movie`
	- •	The manager sends a request to delete a movie by its ID.
	- •	The endpoint marks the movie as inactive (soft delete) and also deletes all associated sessions.

    ![Delete Movie](./assets/delete-movie.png)

- #### ➕ `Add New Session to a Movie`
	- •	The manager sends a request to add a new session to a specific movie by providing session details like date, time slot, and room number.
	- •	Before adding the session, the endpoint checks if the room is available for the specified date and time slot to avoid conflicts.
	- •	If the session details are valid and no conflicts are found, the session is added to the movie, and a success message is returned.
	- •	If there is a conflict (e.g., the room is already booked), the request is rejected with an error message.

    ![Add New Session](./assets/add-session.png)
    ![Add New Session Conflict](./assets/add-session-conflict.png)

- #### 🗑️ `Delete Session`
	- •	The manager sends a request to delete a specific session by its ID.
	- •	The endpoint deletes the session if it exists, ensuring that it is no longer available for bookings or ticket purchases.

    ![Delete Session](./assets/delete-session.png)

- #### 🗑️ `Delete All Sessions`
	- •	The manager sends a request to delete all sessions associated with a specific movie by its ID.
	- •	The endpoint deletes all sessions of the movie, ensuring that no future sessions remain scheduled.

    ![Delete All Sessions](./assets/delete-all-sessions.png)

- #### 🎟️ `Buy Ticket`
	- •	The user sends a request to purchase a ticket for a specific movie session by providing the session ID.
	- •	The endpoint checks if the session exists, if the user meets the age restriction, and if the session has not already passed.
	- •	If all conditions are met, the ticket is created and and an email sent to user in order to show it in movie entrance to enter the movie saloon. In other words `Buy Ticket` flow is connected with `Watch Movie` flow in terms of business.
	- •	A success message is returned along with the ticket details.
	- •	If any condition fails (e.g., session not found, user too young), an error message is returned.

    ![Buy Ticket](./assets/buy-ticket.png)
    ![Ticket Email](./assets/ticket-email.png)

- #### 🎥 `Watch Movie`
	- •	The user sends a request to watch a movie using a purchased ticket by providing the ticket ID.
	- •	The endpoint checks if the ticket is valid, belongs to the user, and if the session has not already passed.
	- •	If all checks pass, the ticket is marked as used, and a success message is returned.
	- •	If the ticket is invalid, already used, or does not belong to the user, an error message is returned.

    ![Watch Movie](./assets/watch-movie.png)


# 🚀 Running The Application

## 1. 💻 Running Locally
To run the application `locally`, please follow below steps. 
- If you don't want to have a headache 😄, go to [Running on Docker](#running-on-docker) section.

### 1.1 📋 Prerequisites
Before you begin, ensure you have the following installed on your system:
- Node.js (v21.7.3)
- PostgreSQL
- Redis
- RabbitMQ
- Sendgrid (No worries, I'll provide the requirements 😊)
- Docker (optional for Docker-Compose based setup)


### 1.2 🔧 Installation Steps

Before you begin, ensure that you have `Docker` and `NodeJS (v21.7.3)` installed on your machine. 

- If Docker is not installed, please refer to the official Docker documentation for installation instructions: [Install Docker Desktop on Mac](https://docs.docker.com/desktop/mac/install/) 

- If NodeJS is not installed, please refer to the official NodeJS documentation for installation instructions: [Install NodeJS on Mac](https://nodejs.org/en/download/package-manager) 

```bash
node -v
docker -v
```

### 1.3 🔧 Installing Redis with Docker

Redis is an open-source, in-memory data structure store that is used as a database, cache, and message broker. To install Redis using Docker, follow these steps:

```bash
docker pull redis
docker run --name redis -d -p 6379:6379 redis
```

This command will download the latest Redis image from Docker Hub and run it in a Docker container named `redis`.

### 1.4 🔧 Installing PostgreSQL with Docker
PostgreSQL is an open-source relational database management system. To install PostgreSQL using Docker, follow these steps:

```bash
docker pull postgres
docker run --name postgres -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres
```

This command will download the latest PostgreSQL image from Docker Hub and run it in a Docker container named `postgres` with username `postgres` and password `postgres`.

### 1.5 🔧 Installing RabbitMQ with Docker

RabbitMQ is a message broker that implements the Advanced Message Queuing Protocol (AMQP). To install RabbitMQ using Docker, follow these steps:

```bash
docker pull rabbitmq:3-management
docker run --name rabbitmq -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

This command will download the latest RabbitMQ image from Docker Hub and run it in a Docker container named `rabbitmq`. The '-management' tag enables the RabbitMQ management plugin, which provides a web UI for administration.


### 1.6 ✅ Verification
To verify that the installations were successful, you can use Docker commands to check the status of the containers:


```bash 
docker ps
```
This command will list all running Docker containers. You should see containers named `redis`, `postgres` and `rabbitmq` in the list.

## 2. 💻 Running on Docker

### 2.1 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:
- `Docker`
- `Docker Compose`

You can check if Docker and Docker Compose are installed by running the following commands:

```bash
docker --version
docker-compose --version
```

### 2.2 🔧 Installing
A step-by-step series of examples that tell you how to get a development environment running.

### 2.3 Build and Run with Docker Compose
Run the following command to build and start the containers:

```bash
docker-compose up -d --build
```

This command will start all the services defined in your `docker-compose.yaml` file in detached mode, due to the `-d` flag, allowing them to run in the background. The `--build` option ensures that Docker builds images for the services before starting the containers, making sure you're running the latest versions of your applications.

## 3. 📦 Installing Dependencies

To install the project dependencies, navigate to the project directory and run the following command:

First we need to be sure that our node version to 21.7.2. If we are using version manager tool like `nvm` we can type:

```bash
nvm use
```
After that, run:

```bash
npm install
```

## 4. 🔐 Setting up Environment Variables

- #### `App Initializer` Flow
    App Initializer runs when the application starts. `It registers an admin manager user using environment variables to the database`.
    Its because only manager can create managers and some of the endpoints are protected from customers.
    `It also registers a customer just for easy test purposes`.


To create the `.env` file in the project root directory, you can use the `touch` command:

```bash
touch .env
```

We have default environment variables listed below. However, we have ones that we couldnt publish any condititons. In real life, we prefer them to store in Vault, AWS KMS etc. Then, you can enter the file and add the following environment variables using a text editor

```bash
# Application
PORT=3000
NODE_ENV=dev
LOG_LEVEL=debug

# Redis
REDIS_URL=redis://localhost:6379
TEST_REDIS_URL=redis://localhost:6380  

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
TEST_RABBITMQ_URL=amqp://guest:guest@localhost:5673  

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/movie-management
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/movie-management-test  

# Email
SENDGRID_SINGLE_SENDER_EMAIL=bahadir.unal123@gmail.com
SENDGRID_API_KEY=Please_Use_The_Key_That_I_Sent_To_You_Via_Email

# JWT
JWT_SECRET=WZD+yI3tlH3YKeq2pQ9y8IqaRAW/my8S55+HJKyqcu0=
JWT_EXPIRATION_TIME=1h

# Crypto
CRYPTO_SALT=movie-management-assignment
CRYPTO_IV=12345678901234567890123456789012
CRYPTO_SECRET=ecuxmPWLqNE0bQLHtn8W6VMgIKQf7zQaL1SeqS/srws=

# Initial Data
INITIAL_MANAGER_EMAIL=manager@test.com
INITIAL_MANAGER_USERNAME=manager
INITIAL_MANAGER_PASSWORD=example-password
INITIAL_USER_EMAIL=user@test.com
INITIAL_USER_USERNAME=user
INITIAL_USER_PASSWORD=example-password
```
	 
> **Info**: If you want to generate your secure JWT secret key using OpenSSL standards, run the following command in your terminal:
```bash
openssl rand -base64 32
```

This command generates a cryptographically secure 32-byte random string encoded in base64, which is ideal for use as a JWT secret.

Make sure to replace the values with your own configuration.

### 🚀 5. Running the Application

To start the application, run the following command:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# 🌐 Accessing the Application
Once the containers are up and running, you can access the application at `http://localhost:3000`.

#### Swagger Documentation URL is [http:localhost:3000/documentation](http:localhost:3000/documentation)

![Swagger Documentation Interface](./assets/all-endpoints.png)

# 🏗️ Infrastructure Discovery

- ### 1.1 🔍 Inspecting PostgreSQL

  Sample Database tables seems like that:
  
  Users Table:

  ![User Content](./assets/db-content-user.png)

  Movies Table:

  ![Movies Content](./assets/db-content-movie.png)

  Sessions Table:

  ![Sessions Content](./assets/db-content-session.png)

  Tickets Table:

  ![Tickets Content](./assets/db-content-ticket.png)

  Watch Histories Table:

  ![Watch History Content](./assets/db-content-watch-history.png)

  
- ### 1.2 🔍 Inspecting Redis
  We can track the request rate limit logs from [Redis Insight](https://redis.io/insight/)
  ![Swagger Documentation Interface](./assets/redis.png)

- ### 1.3 🔍 Inspecting RabbitMQ
  To inspect and manage RabbitMQ:

  - #### 🔧 Access RabbitMQ Management Interface
	RabbitMQ comes with a management plugin that provides a web-based UI to manage and monitor your RabbitMQ server. By default, it runs on port `15672`.

	Navigate to `http://localhost:15672` in your web browser. 
  ![RabbitMQ Management UI](./assets/rabbit-login.png)

    The default login credentials are:
	- **Username:** `guest`
	- **Password:** `guest`



  - #### 📊 Inspect Queues and Messages
	Within the RabbitMQ Management Interface, you can inspect queues, messages, exchanges, and more. This is useful for debugging and monitoring the message flow in your application.

     #### 🔄 Exchanges:
    ![RabbitMQ Management UI](./assets/exhanges.png)
     #### 📬 Queues:
    ![RabbitMQ Management UI](./assets/queues.png)

  - #### 🔁 Inspect Retry and Fail Queue Mechanism

     #### 🔄 Task Fail in Main Queue, Succeed in Fail Queue (`Fail and Recovery Scenario`):
    ![RabbitMQ Fail And Recovery Scenario](./assets/fail-and-recovery-scenario.png)
     #### ❌ Task Fail Both Main and Fail Queue (`Full Fail Scenario`):
     ##### Note: Further, we can bound here a DLQ for messages that need manual checking
    ![RabbitMQ Full Fail Scenario](./assets/full-fail-scenario.png)

# 🧪 Running the Tests

## 🧪 Unit Tests:

We can run the unit test with following commands:

```bash
# unit tests
$ npm run test:unit
```
With coverage:
```bash
# unit tests coverage
$ npm run test:cov:unit
```

- ## 📊 Unit Tests Coverage:
  ![Unit Test Coverage Content](./assets/unit-test-cov.png)

 ## 🧪 E2E Tests:

  - The e2e tests are `configured to automatically spin up Dockerized PostgreSQL, Redis and RabbitMQ instances specifically for testing purposes`. 
  - This isolated test environment ensures that your tests run against clean and consistent infrastructure, avoiding any interference with your development or production services.

  - The following commands are executed automatically when running the E2E tests:

```json
"pretest:e2e": "docker compose -f docker-compose.test.yaml up -d test-db test-redis test-rabbitmq && sleep 5",
"test:e2e": "NODE_ENV=test jest --runInBand --detectOpenHandles --forceExit --config ./test/jest-e2e.json; npm run posttest:e2e",
"posttest:e2e": "docker compose -f docker-compose.test.yaml stop test-db test-redis test-rabbitmq && docker compose -f docker-compose.test.yaml rm -f test-db test-redis test-rabbitmq"
```

We can run the unit test with following commands:

```bash
# e2e tests
$ npm run test:e2e
```

With coverage:

```bash
# e2e tests coverage
$ npm run test:cov:e2e
```
 
## E2E Tests Cases:

### AuthController  

- ✅ Successfully register a new user.  
- ✅ Successfully log in with valid credentials.  
- ❌ Unsuccessful login attempt due to invalid credentials.  
- ❌ Unauthorized attempt to create a manager account.  
- ✅ Successfully create a manager account with proper authorization.  

### HealthController  

- 🔍 Verify the application's **liveness probe**.  
- 🔍 Validate the application's **readiness probe**.  

### MoviesController  

- ✅ Successfully create a movie with sessions when authorized as a manager.  
- ❌ Unauthorized attempt to create a movie without any credentials.  
- ❌ Forbidden attempt to create a movie with standard user permissions.  
- ✅ Successfully retrieve a list of all movies.  
- ✅ Successfully fetch a movie by its ID.  
- ✅ Successfully add multiple movies with sessions using manager authorization.  
- ❌ Failed bulk addition of movies due to **conflicting session data** (transaction rollback).  
- ❌ Failed bulk addition of movies due to **insufficient user permissions**.  
- ❌ Failed bulk addition of movies due to **lack of authentication**.  
- ✅ Successfully delete multiple movies using manager authorization.  
- ❌ Failed bulk deletion of movies due to **insufficient user permissions**.  
- ❌ Failed bulk deletion of movies due to **lack of authentication**.  
- ✅ Successfully update a movie with sessions when authorized as a manager.  
- ❌ Unauthorized attempt to update a movie without any credentials.  
- ❌ Forbidden attempt to update a movie with standard user permissions.  
- ✅ Successfully delete a movie by ID when authorized as a manager.  
- ❌ Unauthorized attempt to delete a movie without any credentials.  
- ❌ Forbidden attempt to delete a movie with standard user permissions.  

### SessionsController  

- ✅ Successfully create a movie session with manager authorization.  
- ❌ Unauthorized attempt to create a session without any credentials.  
- ❌ Forbidden attempt to create a session with standard user permissions.  
- ✅ Successfully delete a session with manager authorization.  
- ❌ Forbidden attempt to delete a session with standard user permissions.  
- ❌ Unauthorized attempt to delete a session without any credentials.  

### TicketsController  

- ❌ Failed ticket purchase due to **age restriction**.  
- ✅ Successful ticket purchase as the user meets the age requirement.  
- ❌ Failed ticket purchase as the session has already ended.  
- ✅ Successful ticket purchase by a manager.  
- ❌ Unauthorized ticket purchase attempt due to **lack of user authentication**.  
- ✅ Manager successfully watches a movie with a valid ticket.  
- ❌ Manager fails to watch a movie using a ticket that has already been used.  
- ✅ User successfully watches a movie with a valid ticket.  
- ❌ User fails to watch a movie using a ticket that has already been used.  

## 📊 E2E Tests Coverage:

![E2E Test](./assets/e2e-test-cov.png)

![E2E Test2](./assets/e2e-test-cov-2.png)

![E2E Test3](./assets/e2e-test-cov-3.png)


### 🔮 Future Work

`1. Add Rating and Review Feature`
    • Collect customer feedback for our businness and recommend some content according to it. In order to preserve user retention.
	• We can also use our email feature to support rating and review process.

`2. Paging` 
	• Cursor Based Pagination and Sorting (e.g., movies, sessions, ratings, reviews).
	
`3. Scalability and Performance`
	• Database Optimization and Indexes. Partitioning can also be considered based on the 'movieDate'.
	• Maintainable and Multi-AZ Fault tolerant Deployment Configuration for managing accessibility and congestion, 
	• Caching: Implement caching strategies on frequently accesed contents. (e.g., fetching movies)

`4. Event-Driven Architecture`
	• Implement Event Sourcing: Introduce an event-driven architecture to handle complex business logic, such as ticket sales or movie / session creation, which could benefit from asynchronous processing and better decoupling.

`5. Improved Security Measures`
    • Move to Access Based Access Control (ABAC) for flexiable Role Management.

`6. CQRS (Command Query Responsibility Segregation)`
	• Separate read and write operations into distinct services to optimize performance and scalability
	• Implement dedicated read models optimized for specific query patterns
	• Use event sourcing to maintain consistency between command and query sides
	• Add specialized query services for complex reporting and analytics needs


### 🎯 Challenges
  1.  A relational database was the most suitable choice given the interconnected nature of users, tickets, movies, and sessions. So, it was essential for ensuring data integrity and enabling efficient querying across these entities. However, my working expertise does not strictly focus on SQL databases even if i believe that i can handle several tasks. Despite this case has some learning curve for me in some points, It's good opportunity for me to challange myself.

  2. At a certain stage of the process, I faced additional difficulties as I fell sick, which made it challenging to keep up with the project. Despite this setback, I managed to push through and complete my work. I would like to extend my gratitude to Yasin who supported me during this time. It truly made a difference ❤️

  3. Unfortunately, I could not complete the deployment of the project with its whole infrastructure on AWS due to some time constraints. 

## 📞 Stay in touch

- Author - [Bahadır Ünal](https://www.linkedin.com/in/bahadır-ünal-78547916a)
