pipeline {
    agent any

    stages {
        stage("Deploy Verdaccio") {
            when {
                changeset "**/verdaccio/**"
            }
            steps {
                sh """
                export DOCKER_HOST=tcp://176.9.72.49:2375
                docker-compose -f ./verdaccio/docker-compose.yml up -d --build
                """
            }
        }
        stage("Build ") {
            steps {
                sh """
                yarn install
                yarn ci
                """
            }
        }
        stage("Deploy develop") {
            when {
                branch "develop"
            }
            steps {
                sh """
                git fetch --tags --force
                yarn canary
                """
            }
        }
        stage("Deploy master") {
            when {
                branch "master"
            }
            steps {
                sh """
                yarn publish-all
                """
            }
        }
    }
}
