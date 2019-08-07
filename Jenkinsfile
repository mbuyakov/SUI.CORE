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
        stage("Build") {
            when {
                branch "master"
            }
            steps {
                sh """
                git fetch --tags --force
                yarn install
                yarn ci
                """
            }
        }
//         stage("Deploy develop") {
//             when {
//                 branch "develop"
//             }
//             steps {
//                 sh """
//                 yarn canary
//                 """
//             }
//         }
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
