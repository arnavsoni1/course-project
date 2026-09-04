pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        // Docker image repository names must be lowercase.
        DOCKER_USERNAME = 'arnavsoni2007'
        IMAGE_NAME = 'codegrid'
        IMAGE_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = "codegrid-smoke-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install and Build Application') {
            steps {
                powershell 'npm ci'
                powershell 'npm run build'
            }
        }

        stage('Verify Docker') {
            steps {
                powershell 'docker --version'
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    docker build `
                      --tag "$env:DOCKER_USERNAME/$env:IMAGE_NAME:$env:IMAGE_TAG" `
                      --tag "$env:DOCKER_USERNAME/$env:IMAGE_NAME:latest" `
                      .
                '''
            }
        }

        stage('Smoke Test Image') {
            steps {
                powershell '''
                    docker run --detach --rm `
                      --name "$env:CONTAINER_NAME" `
                      "$env:DOCKER_USERNAME/$env:IMAGE_NAME:$env:IMAGE_TAG"
                    docker exec "$env:CONTAINER_NAME" `
                      wget --quiet --output-document=- http://127.0.0.1/ `
                      | Select-String -Quiet '<title>codegrid</title>'
                '''
            }
            post {
                always {
                    powershell 'docker stop "$env:CONTAINER_NAME" *> $null; exit 0'
                }
            }
        }

        stage('Login and Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cred',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    powershell '''
                        $normalizedDockerHubUser = $env:DOCKERHUB_USER.ToLowerInvariant()
                        if ($normalizedDockerHubUser -ne $env:DOCKER_USERNAME) {
                            throw "Docker Hub username does not match DOCKER_USERNAME"
                        }
                        $env:DOCKERHUB_TOKEN | docker login --username $env:DOCKERHUB_USER --password-stdin
                        docker push "$env:DOCKER_USERNAME/$env:IMAGE_NAME:$env:IMAGE_TAG"
                        docker push "$env:DOCKER_USERNAME/$env:IMAGE_NAME:latest"
                    '''
                }
            }
        }
    }

    post {
        always {
            powershell 'docker logout *> $null; exit 0'
        }
        success {
            echo "Published ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} and :latest"
        }
    }
}
