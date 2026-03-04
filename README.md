# Workshop AI — E-Commerce Scaffold

Full-stack e-commerce scaffold for a live-coding workshop where teams build a checkout flow using **Claude Code CLI**.

The scaffold provides a working **Product Catalog** + **Shopping Cart**. Workshop participants extend it with a **Checkout** flow during a 1-day (~5h) session.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular | 21.2.0 |
| UI Library | Spartan UI | 0.0.1-alpha.644 |
| Styling | Tailwind CSS | 3.4.19 |
| Backend | Spring Boot | 4.0.3 |
| Database | SQL Server | 2022 (Docker) |
| Java | JDK | 21+ |

## Prerequisites

- **Java 21+** (JDK)
- **Node.js 22+** with npm
- **Docker** (for SQL Server 2022)
- **Maven 3.9+**

## Quick Start

```bash
# 1. Start the backend (auto-starts SQL Server via Docker Compose)
cd backend
mvn spring-boot:run
# Backend runs on http://localhost:9000
# Swagger UI: http://localhost:9000/swagger-ui

# 2. Start the frontend (in a separate terminal)
cd frontend
npm install
npx ng serve
# Frontend runs on http://localhost:4200
# API calls are proxied to localhost:9000
```

## Running Tests

```bash
# Backend — unit tests
cd backend && mvn test

# Backend — unit + integration tests (requires Docker)
cd backend && mvn verify

# Frontend — unit tests
cd frontend && npx ng test --no-watch

# Frontend — E2E tests (requires backend running on port 9000)
cd frontend && npx playwright test
```

## Project Structure

```
workshop-ai/
├── backend/          # Spring Boot 4 REST API
├── frontend/         # Angular 21 SPA
└── README.md         # This file
```

See `backend/README.md` and `frontend/README.md` for detailed documentation.
