# Queue Management System

### A simpler queue for one location.

QMS helps your team serve visitors with **one General Service**, multiple counters, and a clear live display. Visitors can join at the kiosk or online, while staff manage the queue from one shared system.

[![CI](https://img.shields.io/github/actions/workflow/status/Kidusdybala/QMS/ci.yml?branch=main&label=build&logo=github&logoColor=white)](https://github.com/Kidusdybala/QMS/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-2ea44f?logo=apache)](LICENSE)
[![Languages](https://img.shields.io/badge/languages-English%20%7C%20Arabic%20%7C%20Amharic-7357c8)](#languages)
[![Queue setup](https://img.shields.io/badge/setup-1%20location%20%7C%201%20service-168aad)](#what-you-get)

---

## ✨ What you get

| | Feature | What it does |
|---|---|---|
| 🎟️ | **General Service** | One straightforward service for every walk-in visitor |
| 🧍 | **Kiosk and web joining** | Issue a ticket in person or join from a phone |
| 🖥️ | **Live display** | Show called tickets and counters with a large live date and clock |
| 👩‍💼 | **Staff queue tools** | Call, recall, start, complete, requeue, cancel, and mark no-shows |
| 📅 | **Appointments** | Schedule visits for the General Service |
| 📊 | **Analytics** | Review queue volumes, wait times, service times, and export CSV data |
| 🔔 | **Notifications** | Configure email and optional SMS or WhatsApp providers |
| 🌐 | **Three languages** | Switch between English, العربية, and አማርኛ, with RTL support for Arabic |

## 🚀 Run with Docker

You need Docker Desktop with Docker Compose enabled.

```bash
cp .env.example .env
docker compose up --build -d
```

Open the app and supporting tools:

| App | Address |
|---|---|
| QMS | <http://localhost:8080> |
| API health | <http://localhost:3000/health> |
| Mailpit inbox | <http://localhost:8025> |

The development Compose setup creates the database schema and seed records automatically. Check service status with `docker compose ps`; stop the app with `docker compose down`.

### Use the kiosk, display, and staff PCs together

Run Docker on one PC connected to the same trusted local network as the kiosk, display, and staff/admin PCs. Find that host PC's LAN address (for example, `192.168.1.20`), then set these values in `.env`:

```dotenv
WEB_ORIGIN=http://192.168.1.20:8080
VITE_API_BASE=http://192.168.1.20:3000
QMS_API_CONNECT_SRC='self' http://192.168.1.20:3000 ws://192.168.1.20:3000
```

Rebuild and start the containers after changing the address, because the web app's API address is set during its image build:

```bash
docker compose up --build -d
```

On each device, open the host PC's address, not `localhost`:

| Device | Page |
|---|---|
| Customer kiosk | `http://192.168.1.20:8080/kiosk` |
| Public queue display | `http://192.168.1.20:8080/display` |
| Staff PC | `http://192.168.1.20:8080/staff` |
| Admin PC | `http://192.168.1.20:8080/admin` |

Replace `192.168.1.20` with the host PC's actual LAN address. Allow inbound TCP ports 8080 and 3000 through that PC's firewall on the private network. Keep the kiosk signed out, configure Windows/Edge kiosk mode to launch the `/kiosk` URL, and use staff/admin pages from staff PCs with individual accounts. Staff and admin pages require sign-in, and privileged API actions check the account role. Do not expose these development Compose ports directly to the public internet.

### Development login

The seed creates a demo administrator:

| Email | Password |
|---|---|
| `admin@example.com` | `admin12345` |

These credentials are for local development only. Set a strong `SESSION_SECRET` and replace demo credentials before deploying anywhere public.

## 🧭 Main pages

| Page | Address | Use |
|---|---|---|
| Kiosk | `/kiosk` | Create a General Service ticket |
| Staff | `/staff` | Call and manage waiting tickets |
| Display | `/display` | Show called tickets, counters, date, and time |
| Admin | `/admin` | Manage counters, users, appointments, notifications, and retention |
| Join online | `/join/main` | Join the queue from a phone |
| Ticket status | `/ticket/:id` | Check a ticket’s queue position and estimated wait |

The protected analytics endpoints are `/analytics/summary` and `/analytics/tickets.csv`. They accept optional `start` and `end` date filters.

## 🌐 Languages

Choose English, العربية, or አማርኛ from the header. Arabic switches the interface to right-to-left layout.

## 🛠️ Local development

Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/), then start the database, cache, and mail preview service:

```bash
cp .env.example .env
pnpm install
pnpm db:generate
docker compose up -d postgres redis mailpit
pnpm db:push
pnpm db:seed
pnpm dev
```

The web app runs at <http://localhost:5173> and the API at <http://localhost:3000>.

## 🧰 Built with

| Layer | Technology |
|---|---|
| Web | React, TypeScript, Vite |
| API | NestJS, TypeScript |
| Data | PostgreSQL, Prisma |
| Live updates | WebSockets and Redis |
| Local services | Docker Compose |

## 🗂️ Repository layout

```text
apps/api       NestJS API, Prisma schema, and seed data
apps/web       React and Vite interface
packages/domain  Shared queue types and logic
packages/ui      Shared UI components
infra          Deployment and operations guides
research       Product research
```

## 📚 Guides

- [Infrastructure and Docker Compose](infra/README.md)
- [Production deployment](infra/production.md)
- [Public demo environment](infra/demo.md)
- [Backup and restore](infra/backup-restore.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## 📄 License

QMS is licensed under the [Apache License 2.0](LICENSE).
