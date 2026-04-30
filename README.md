# Student Expense Tracker (Secure Full-Stack)

A **production-ready full-stack application** designed to help students manage their finances securely, featuring **modern authentication, API security, and scalable architecture**.

---

## ✨ Key Highlights
- 🔐 **Secure by Design** – JWT authentication, role-based access control, and rate limiting
- ⚙️ **Full-Stack Architecture** – Spring Boot backend + React frontend
- 📊 **Real-Time Dashboard** – Track expenses with dynamic summaries
- 🐳 **Dockerized Setup** – Easy local development with PostgreSQL
- 🛡️ **Security Best Practices** – Input validation, password hashing, and protected APIs

---

## 🏗️ Tech Stack

**Frontend**
- React (Vite)
- JavaScript, HTML, CSS

**Backend**
- Spring Boot (Java)
- REST API architecture
- JWT Authentication

**Database**
- PostgreSQL

**DevOps**
- Docker & Docker Compose

---

## ⚡ Quick Start (Local Development)
cd backend
./mvnw spring-boot:run
👉 http://localhost:8081

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| POST   | `/api/auth/register`     | Register new user         |
| POST   | `/api/auth/login`        | Authenticate & return JWT |
| GET    | `/api/users/me`          | Get current user          |
| CRUD   | `/api/expenses`          | Manage expenses           |
| CRUD   | `/api/categories`        | Manage categories         |
| GET    | `/api/dashboard/summary` | Expense insights          |

insights
🔐 Security Features

This project demonstrates practical backend security implementation:

🔑 BCrypt Password Hashing
🪪 JWT Authentication
👥 Role-Based Authorization (USER / ADMIN)
✅ Input Validation (Bean Validation)
🧱 Secure ORM Queries (JPA)
🚦 Rate Limiting on Auth Endpoints

🧠 What This Project Demonstrates
Building secure REST APIs using Spring Boot
Designing scalable full-stack systems
Implementing real-world authentication flows
Applying defensive security practices
Structuring a production-ready monorepo

📌 Future Improvements
Deployment (AWS / Azure)
CI/CD pipeline (GitHub Actions)
Advanced analytics dashboard
Refresh tokens & session management

Author:Bophelo-Botle Makuzeni

🌐 Portfolio: https://bophelobotle.netlify.app/

💼 LinkedIn: https://www.linkedin.com/in/bophelo-botle-makuzeni-787029366/

🧑‍💻 GitHub: https://github.com/BopheloBotle

