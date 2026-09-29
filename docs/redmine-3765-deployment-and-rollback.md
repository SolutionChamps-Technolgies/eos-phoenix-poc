# Redmine #3765 - Deployment and rollback notes.

Documentation only for the eos-phoenix-poc NestJS application. This repository does not define a deployment environment, host, artifact store, process manager, or credentials. Sections marked **Placeholder** are not configured. Do not treat them as existing servers or production procedures.

All employee records served by this application are synthetic.

## Current application

| Item | Value in this repository |
| --- | --- |
| Application | eos-phoenix-poc 0.1.0, private NestJS application |
| Runtime | Node.js 22 (`engines.node` is `>=22`; CI uses Node.js 22) |
| Package manager | pnpm 9.15.4 (`packageManager`) |
| Language | TypeScript, compiled by the NestJS CLI |
| Install | `pnpm install` locally; CI uses `pnpm install --frozen-lockfile` |
| Build script | `pnpm build` (`nest build`), output directory `dist` |
| Local start script | `pnpm start` (`nest start`) |
| Listen port | `PORT` if set, otherwise `3000` |
| HTTP routes in code | `GET /health`, `GET /employees` |

`pnpm start` uses the NestJS CLI, which is a dev dependency. This repository does not define a separate production start script, container image, or process supervisor.

## Existing CI checks

Workflow: `.github/workflows/ci.yml`

Triggers: `push` and `pull_request`.

Runner: `ubuntu-latest`.

The job **lint, test, and build** runs, in order:

1. Check out the repository (`actions/checkout@v4`).
2. Set up pnpm (`pnpm/action-setup@v4`, version from `packageManager`).
3. Set up Node.js 22 (`actions/setup-node@v4`) with the pnpm cache.
4. `pnpm install --frozen-lockfile`
5. `pnpm lint`
6. `pnpm test` (Jest unit tests)
7. `pnpm test:e2e` (HTTP tests, including `GET /health` and `GET /employees`)
8. `pnpm build`

CI does not deploy the application.

## Local build and startup

Prerequisites: Node.js 22 and pnpm 9.

```bash
pnpm install
pnpm build
pnpm start
```

`pnpm start` listens on port 3000 unless `PORT` is set. These commands run on the machine where they are invoked. They are not a deployment.

## Proposed deployment checklist

Use this only after a target environment exists. Items marked **Placeholder** are not configured in this repository.

1. Select the git commit to deploy and confirm the CI workflow above succeeded for that commit.
2. Record the commit SHA being deployed.
3. **Placeholder:** deploy into `<NOT CONFIGURED: target environment name>`.
4. **Placeholder:** use host `<NOT CONFIGURED: hostname or address>`.
5. **Placeholder:** publish or copy the build to `<NOT CONFIGURED: artifact or deploy path>`.
6. On a machine with Node.js 22 and pnpm 9.15.4, install from the lockfile and build:

   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   ```

7. **Placeholder:** start the process with `<NOT CONFIGURED: start command or process manager>`. The repository start script is `pnpm start` for local use. No hosted start command is defined.
8. **Placeholder:** set `PORT` to `<NOT CONFIGURED: port>`. If `PORT` is unset, the process listens on `3000`.
9. Run the health check below against the base URL for that environment.
10. Leave the previous build or commit available for rollback. **Placeholder:** record it at `<NOT CONFIGURED: location of the previous deploy record>`.

## Health check

`GET /health` returns a small deterministic JSON body. No authentication scheme is configured.

Local example:

```bash
curl http://localhost:3000/health
```

Expected HTTP 200 body:

```json
{
  "status": "ok",
  "service": "eos-phoenix-poc"
}
```

**Placeholder:** for a deployed environment, call `GET <NOT CONFIGURED: base URL>/health`. Treat the deploy as unsuccessful unless the status is 200 and the body matches the JSON above.

## Rollback

Rollback means restoring the previously deployed build or the previously deployed commit. This repository does not record either one, and it does not define how a running process is stopped or replaced.

1. **Placeholder:** read the last deployed commit SHA or build identifier from `<NOT CONFIGURED: location of the previous deploy record>`.
2. Choose one of these sources, using only a build or commit that was previously deployed:
   - the saved build from `<NOT CONFIGURED: artifact or deploy path for the previous build>`, or
   - a checkout of the previous commit SHA, then `pnpm install --frozen-lockfile` and `pnpm build` with Node.js 22 and pnpm 9.15.4.
3. **Placeholder:** stop the current process with `<NOT CONFIGURED: stop command or process manager>`.
4. **Placeholder:** start the restored build with `<NOT CONFIGURED: start command or process manager>`.
5. Run `GET /health` as described above. Rollback is complete only when the response is HTTP 200 and the body is `{ "status": "ok", "service": "eos-phoenix-poc" }`.
6. **Placeholder:** record the restored commit or build at `<NOT CONFIGURED: location of the previous deploy record>`.

If the health check does not match, the rollback has not been verified. No further recovery procedure is defined in this repository.
