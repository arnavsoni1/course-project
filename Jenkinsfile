pipeline {
    agent any

    tools {
        maven 'M3'
    }

    environment {
        IMAGE = 'arnavsoni2007/codegrid'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build JavaScript with Maven') {
            steps {
                bat 'mvn clean verify'
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell 'docker build -t "${env:IMAGE}:${env:BUILD_NUMBER}" -t "${env:IMAGE}:latest" .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    powershell '''
                        $env:DOCKERHUB_TOKEN | docker login --username $env:DOCKERHUB_USER --password-stdin
                        docker push "${env:IMAGE}:${env:BUILD_NUMBER}"
                        docker push "${env:IMAGE}:latest"
                    '''
                }
            }
        }
    }
}
