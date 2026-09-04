# Codegrid Docker CI/CD Assignment

Codegrid is a React/Vite coding-practice interface. This repository includes a production Docker image and a Jenkins pipeline that builds, smoke-tests, and publishes the image to Docker Hub.

## Project structure

- `src/main.jsx` and `src/styles.css` — React application
- `Dockerfile` — multi-stage Node build and Nginx runtime image
- `nginx.conf` — static hosting, SPA fallback, caching, and security headers
- `.dockerignore` — excludes development and assessment-only files
- `Jenkinsfile` — checkout, application build, Docker build, smoke test, login, and push

## Run locally

```sh
npm ci
npm run build
npm run dev
```

Vite normally serves the development site at `http://localhost:5173`.

## Build and run with Docker

```sh
docker build -t arnavsoni2007/codegrid:latest .
docker run --detach --rm --name codegrid -p 8080:80 arnavsoni2007/codegrid:latest
```

Open `http://localhost:8080`. In another terminal, verify the container:

```sh
curl --fail http://localhost:8080/
docker inspect --format='{{.State.Health.Status}}' codegrid
docker stop codegrid
```

## Configure Jenkins

1. Install the **Git**, **Pipeline**, and **Credentials Binding** plugins. Docker must be installed and usable by the Jenkins service account.
2. In **Manage Jenkins → Credentials → System → Global credentials**, add a **Username with password** credential:
   - Username: Docker Hub username (`ArnavSoni2007` for the checked-in pipeline)
   - Password: a Docker Hub access token
   - ID: `dockerhub-cred`
3. Create a **Pipeline** job and choose **Pipeline script from SCM**.
4. Select **Git**, enter this repository URL, set the branch to `*/main`, and keep the script path as `Jenkinsfile`.
5. Run **Build Now**. The numbered tag and `latest` are pushed only after the application build and image smoke test pass.

Docker image references are lowercase, so the account `ArnavSoni2007` is published as `arnavsoni2007/codegrid`. If a different Docker Hub account is used, change `DOCKER_USERNAME` in `Jenkinsfile` before running the job.

## Pipeline stages

1. Checkout Code
2. Install and Build Application
3. Verify Docker
4. Build Docker Image
5. Smoke Test Image
6. Login and Push to Docker Hub

Credentials are injected only during the publish stage and are sent to `docker login` through standard input.
