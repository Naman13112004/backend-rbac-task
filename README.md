# Scalable RBAC Backend System

A production-ready, highly scalable REST API with Role-Based Access Control (RBAC), JWT Authentication, Redis caching, Rate Limiting, and a companion Next.js React frontend. Built to fulfill and exceed the assignment requirements within the 3-day timeline.

---

## 🚀 Tech Stack

### Backend
- **Framework**: Next.js 16 (App Router - API Routes)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Serverless DB)
- **ORM**: Prisma 6
- **Authentication**: `jose` (Edge-compatible JWT), `bcrypt` (Password hashing)
- **Validation**: Zod (Runtime type-safety and request validation)
- **Caching & Rate Limiting**: Redis (Redis Cloud)
- **Logging**: Winston

### Frontend (Supportive UI)
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with localStorage persistence)
- **Form Handling**: React Hook Form + `@hookform/resolvers/zod`
- **Notifications**: React Hot Toast

### DevOps & Deployment
- **Containerization**: Docker (Multi-stage builds) & Docker Compose
- **PWA**: `@ducanh2912/next-pwa` (Production Service Workers)

---

## 🎯 Evaluation Criteria & Deliverables Met

✅ **API Design (REST, Status Codes, Modularity)**: Feature-based modular architecture (`src/features`). Strict adherence to RESTful principles using appropriate HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) and semantic status codes (`200`, `201`, `400`, `401`, `403`, `404`, `429`, `500`). Versioned at `/api/v1/`.
✅ **Database Schema Design & Management**: Relational PostgreSQL design managed via Prisma migrations. Secure tracking of `User` (Role enum) and 1-to-many `Task` entities.
✅ **Security Practices**: 
  - JWTs are generated securely and stored strictly in **HTTP-Only, Secure, SameSite=Strict Cookies** (mitigating XSS vulnerabilities).
  - Passwords hashed using `bcrypt` (salt rounds: 10).
  - Zod validation strictly sanitizes all incoming API payloads.
  - Global Rate Limiting via Redis prevents DDoS/brute-force attacks.
✅ **Functional Frontend Integration**: Includes an interactive React frontend with Auth flows, Role context, and a protected Task CRUD Dashboard. 
✅ **Scalability & Deployment Readiness**: Redis caching drastically reduces DB load for `GET` requests. Multi-stage Docker artifacts guarantee environment parity.

---

## 🐳 Setup Instructions

### Environment Variables (`.env`)

**Option A: Local Docker Sub-system (Using `docker-compose`)**
```bash
  PORT=3000
  NODE_ENV=development
  JWT_SECRET="super-secret-local-key"
  JWT_EXPIRES_IN="7d"

  # Local Postgres inside Docker Network
  DATABASE_URL="postgresql://postgres:password@localhost:5432/backend-rbac-task?schema=public"
  DIRECT_URL="postgresql://postgres:password@localhost:5432/backend-rbac-task?schema=public"

  # Local Redis inside Docker Network
  REDIS_HOST="localhost"
  REDIS_PORT="6379"
  # REDIS_PASSWORD="" (leave empty for local)
```

**Option B: Cloud Providers (Neon DB & Redis Cloud)**
```bash
  PORT=3000
  NODE_ENV=development
  JWT_SECRET="your-secure-production-secret"
  JWT_EXPIRES_IN="7d"

  # Cloud Postgres (e.g., Neon)
  DATABASE_URL="postgresql://user:password@ep-long-bird-anm7xv1a-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
  DIRECT_URL="postgresql://user:password@ep-long-bird-anm7xv1a.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

  # Cloud Redis
  REDIS_URL="rediss://default:your-password@your-endpoint.cloud.redislabs.com:6379"
  REDIS_HOST="your-endpoint.cloud.redislabs.com"
  REDIS_PORT="6379"
  REDIS_PASSWORD="your-password"
```

### 1. Local Node.js Setup
1. `npm install`
2. Configure `.env`
3. `npx prisma migrate dev --name init` (Initializes database)
4. `npm run dev` (Starts development server at http://localhost:3000)
*To test PWA offline support locally, run: `npm run build && npm run start`*

### 2. Docker Compose (Full Stack Isolated)
1. Ensure Docker is running.
2. `docker-compose up --build -d`
3. Access the application at `http://localhost:3000`. PostgreSQL runs on `5432` and Redis on `6379`.

---

## 📖 API Documentation (Postman Ready)

**Base URL**: `http://localhost:3000/api/v1`

### 🛡️ Authentication Module `/api/v1/auth`

#### 1. Register User
- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **Description**: Registers a new user. Role is optional (defaults to `USER`).
- **Body** (JSON):
```bash
  {
    "name": "John Doe",
    "email": "john@test.com",
    "password": "password123",
    "role": "USER"
  }
```

#### 2. Login User
- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Description**: Validates credentials. Returns an `accessToken` HTTP-only cookie.
- **Body** (JSON):
```bash
  {
    "email": "john@test.com",
    "password": "password123"
  }
```

#### 3. Logout User
- **Endpoint**: `/auth/logout`
- **Method**: `POST`
- **Description**: Clears the HTTP-only authentication cookies.

---

### 📝 Tasks Module (CRUD) `/api/v1/task`
*(All Task endpoints require the `accessToken` Cookie to be present in the request)*

#### 1. Fetch Tasks
- **Endpoint**: `/task`
- **Method**: `GET`
- **Description**: Fetches tasks. Responses are cached via Redis for 5 minutes.
  - `USER` Role: Sees only their own tasks.
  - `ADMIN` Role: Sees all system-wide tasks.

#### 2. Create Task
- **Endpoint**: `/task`
- **Method**: `POST`
- **Description**: Creates a new task bound to the authenticated user. Invalidates Redis cache.
- **Body** (JSON):
```bash
  {
    "title": "Setup Docker",
    "description": "Write multi-stage Dockerfile for Next.js"
  }
```

#### 3. Update Task
- **Endpoint**: `/task/[:id]`
- **Method**: `PUT`
- **Description**: Updates an existing task by ID. `USER` can only update their own tasks. `ADMIN` can update any.
- **Body** (JSON):
```bash
  {
    "title": "Setup Docker & CI/CD",
    "description": "Write multi-stage Dockerfile and GitHub Actions",
    "completed": true
  }
```

#### 4. Delete Task
- **Endpoint**: `/task/[:id]`
- **Method**: `DELETE`
- **Description**: Deletes a task by ID. Enforces ownership access controls.

---

## 📈 Scalability Note
The architecture of this backend is expressly designed with horizontal scaling in mind:
- **Stateless Authentication**: JWT tokens stored securely on the client side guarantee that the API servers remain completely stateless, allowing deployment across multiple instances or auto-scaling clusters seamlessly.
- **Distributed Caching (Redis)**: Offloads the database from repetitive `GET` queries via a unified Redis cache layer, massively increasing throughput for read-heavy operations. Redis also enforces sliding-window Rate-Limiting across the distributed environment.
- **Microservices Ready**: The feature-driven folder structure (`src/features/*`) decouples domains. The `task` or `auth` features can easily be ripped out into dedicated microservices if vertical scaling hits a ceiling.

---

## 🚧 Shortcomings & Future Work (Production Enhancements)
While this project satisfies the criteria of a scalable REST API reliably, further efforts can solidify its robustness for enterprise traffic:

1. **Database Triggers & Sharding**: Integrating PostgreSQL read-replicas for heavy analytic loads, or clustering the DB to spread disk IOps.
2. **Reverse Proxy & Load Balancing**: While Next.js App Router handles requests natively, sitting the application behind an API Gateway (like Nginx, AWS API Gateway, or Cloudflare) would allow superior DDoS mitigation, SSL termination, and round-robin load balancing.
3. **Automated CI/CD Workflows**: Implementing GitHub Actions to automatically lint, type-check, run unit/integration tests (Jest/Cypress), and push the Docker image to a registry for deploy automation.
4. **Refresh Tokens**: Currently, the system relies strictly on long-lived Access Tokens for simplicity. A standard OAuth2 implementation involving short-lived Access Tokens + rotating Refresh Tokens would maximize session security.
5. **Advanced Observability**: Connecting Winston logs to a centralized ELK stack (Elasticsearch, Logstash, Kibana) or Datadog for distributed tracing and anomaly alerting.
6. **Task Pagination**: The `GET /task` API currently fetches the entire relevant dataset. As tasks grow infinitely, cursor-based or offset-based pagination must be introduced at the Prisma layer to avoid memory overflows.
