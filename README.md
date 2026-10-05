# Codegrid Docker CI/CD Assignment

Codegrid is a React/Vite coding-practice app with a Node API. The frontend loads problems from the API, can create custom problems, runs sample checks, and stores submissions in a local SQLite database.

## Project structure

- `src/main.jsx` and `src/styles.css` — React application
- `api.mjs` — API routes and in-memory problem store
- `submissions.mjs` — SQLite storage for submitted code and submission history
- `server.mjs` — production HTTP server for the API and built frontend
- `Dockerfile` — multi-stage Node build and runtime image
- `vite.config.js` — React setup and the development API middleware
- `.dockerignore` — excludes development and assessment-only files
- `pom.xml` — Maven build wrapper that provisions Node/npm and builds the JavaScript application
- `Jenkinsfile` — checkout, Maven test, Docker build, smoke test, login, and push

## Run locally

```sh
npm ci
npm run build
npm run dev
```

Vite normally serves the development site at `http://localhost:5173`, including the API through its development middleware. For a production-like local server, run `npm run build && npm start` and open `http://localhost:3000`.

Submissions are saved in `data/codegrid.sqlite` by default (created automatically). Set `CODEGRID_DB_PATH` to use another file. `POST /api/submissions` saves the submitted code; `GET /api/submissions` lists submission metadata, optionally filtered with `?problemId=001`. This demo has no user accounts or access controls, so submissions are not separated by user. Sample checks are simulated; submitted code is never executed.

## Build and run with Docker

```sh
docker build -t arnavsoni2007/codegrid:latest .
docker run --detach --rm --name codegrid -p 8080:3000 arnavsoni2007/codegrid:latest
```

Open `http://localhost:8080`. In another terminal, verify the container:

```sh
curl --fail http://localhost:8080/
curl --fail http://localhost:8080/api/health
docker stop codegrid
```

## Configure Jenkins

1. Install the **Git**, **Pipeline**, **Credentials Binding**, and **Maven Integration** plugins. Docker must be installed and usable by the Jenkins service account.
2. In **Manage Jenkins → Tools**, add a Maven installation named `M3`. Either configure the installed Maven home or enable Jenkins-managed installation.
3. In **Manage Jenkins → Credentials → System → Global credentials**, add a **Username with password** credential:
   - Username: Docker Hub username (`ArnavSoni2007` for the checked-in pipeline)
   - Password: a Docker Hub access token
   - ID: `dockerhub-cred`
4. Create a **Pipeline** job and choose **Pipeline script from SCM**.
5. Select **Git**, enter this repository URL, set the branch to `*/main`, and keep the script path as `Jenkinsfile`.
6. Run **Build Now**. Maven provisions Node/npm and runs `npm ci` plus `npm run build` before the Docker image is built or pushed. The numbered tag and `latest` are pushed only after all checks pass.

Docker image references are lowercase, so the account `ArnavSoni2007` is published as `arnavsoni2007/codegrid`. If a different Docker Hub account is used, change `DOCKER_USERNAME` in `Jenkinsfile` before running the job.

For Docker persistence, mount a host directory at `/app/data`, for example add `-v "$PWD/data:/app/data"` to `docker run`. Otherwise the database is lost when the container is removed. Custom problems remain in memory and reset on restart; submissions and accepted progress for built-in problems persist in the SQLite file. Submissions for custom problems remain stored but their problem definitions are not restored.
