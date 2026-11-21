# TaskFlow

> A full-stack, secure task management application built with Java 21, Spring Boot, JWT authentication, PostgreSQL, and a modern Tailwind CSS frontend.

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.2-brightgreen?style=flat-square&logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## Key Features

- **Stateless Authentication:** Secure JWT-based authentication flow with expiration management.
- **Data Isolation:** User-level task isolation enforced at both the repository and controller levels.
- **Full Task Lifecycle (CRUD):** Create, read, update, and delete tasks seamlessly.
- **Interactive UI:**
    - Inline editing for task titles and descriptions.
    - Double-click action to toggle task completion status.
    - Custom modal dialogs for destructive action confirmations.
    - Modern, responsive dark-themed design crafted with Tailwind CSS.
- **Robust Security:** BCrypt password hashing and explicit CORS permissions.
- **DevOps Ready:** Environment-driven secret configuration and Dockerized PostgreSQL environment.

---

## Tech Stack

### Backend
* **Language:** Java 21
* **Framework:** Spring Boot 4.1.2
* **Security:** Spring Security & Custom JWT Filter (`jjwt`)
* **Persistence:** Spring Data JPA / Hibernate
* **Database:** PostgreSQL 15
* **Build Tool:** Maven

### Frontend
* **Core:** HTML5, Vanilla JavaScript (ES6+)
* **Styling:** Tailwind CSS (CDN)
* **Typography:** Plus Jakarta Sans & JetBrains Mono

### Infrastructure & Tooling
* **Containerization:** Docker & Docker Compose
* **Version Control:** Git

---

## Project Structure

```text
src/
├── main/
│   ├── java/com/server/todoapp/
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── TaskController.java
│   │   │   └── UserController.java
│   │   ├── dto/
│   │   │   ├── AuthResponse.java
│   │   │   ├── LoginRequest.java
│   │   │   └── RegisterRequest.java
│   │   ├── model/
│   │   │   ├── Task.java
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   ├── TaskRepository.java
│   │   │   └── UserRepository.java
│   │   ├── security/
│   │   │   ├── CustomUserDetailsService.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   ├── JwtService.java
│   │   │   └── SecurityConfig.java
│   │   └── TodoappApplication.java
│   └── resources/
│       ├── static/
│       │   ├── index.html
│       │   ├── tasks.html
│       │   └── js/
│       │       ├── api.js
│       │       ├── auth.js
│       │       └── tasks.js
│       └── application.properties
└── test/
    └── requests.http
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Java Development Kit (JDK) 21** or higher
- **Docker** and **Docker Compose**
- **Maven** (or use the included `./mvnw` wrapper)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SiPoo8/todoapp.git
   cd todoapp
   ```

2. **Start the database container:**
   ```bash
   docker compose up -d
   ```

3. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:8080`.

---

## Configuration

Application settings are located in `src/main/resources/application.properties`. You can override defaults using environment variables:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5433/todo_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}

jwt.secret=${JWT_SECRET:dev-only-secret-change-in-production}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |

### Task Endpoints

*Note: All task requests require an `Authorization` header formatted as `Bearer <TOKEN>`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve all tasks owned by the current user |
| `GET` | `/api/tasks/{id}` | Retrieve details of a specific task |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/{id}` | Update an existing task |
| `DELETE` | `/api/tasks/{id}` | Delete a specific task |

### Example API Requests

**Register a user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"test123"}'
```

**Fetch tasks:**
```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Security Overview

- **Password Hashing:** Hashes passwords with BCrypt before storing.
- **Stateless Tokens:** JWT tokens are signed using HMAC-SHA with configured expiration timeframes.
- **Resource Protection:** Strict ownership verification blocks unauthorized user requests (`403 Forbidden`).
- **Secret Management:** Sensitive keys and credentials are bound to environment variables.
- **CORS Constraints:** Restricted strictly to explicitly defined domain origins.

---

## Testing

You can evaluate the API endpoints using **Postman**, **curl**, or IntelliJ IDEA's built-in HTTP Client with `src/test/requests.http`.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## Repository

[https://github.com/SiPoo8/todoapp](https://github.com/SiPoo8/todoapp)