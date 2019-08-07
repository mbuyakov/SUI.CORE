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
        stage("Build SUI.CORE") {
            steps {
                sh """
                yarn install
                yarn lint
                yarn test
                yarn build
                """
            }
        }
        stage("Deploy SUI.CORE") {
            steps {
                sh """
                yarn publish --non-interactive --access restricted
                """
            }
        }
    }
}
