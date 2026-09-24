# EOS Phoenix POC

Synthetic NestJS baseline for the EOS Evidence and MI proof of concept. It exposes a health check and a fixed list of invented Project Phoenix employees.

All employee records in this application are synthetic. They are not real people, and this repository does not contain production data, credentials, or client information.

## Prerequisites

- Node.js 22
- pnpm 9

## Installation

```bash
pnpm install
```

## Run locally

```bash
pnpm start
```

The application listens on port 3000 unless `PORT` is set.

## Tests

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## Endpoints

Health:

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "service": "eos-phoenix-poc"
}
```

Employees:

```bash
curl http://localhost:3000/employees
```

```json
[
  {
    "id": "phx-emp-001",
    "displayName": "Mira Calder",
    "jobTitle": "Platform Engineer",
    "department": "Engineering",
    "status": "active"
  }
]
```

`GET /employees` returns the full fixed set of four synthetic employees. The sample above shows the shape of one record.
