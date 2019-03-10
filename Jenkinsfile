pipeline {
	agent any

	stages {
		stage("Deploy Verdaccio") {
            steps {
                sh """
                export DOCKER_HOST=tcp://176.9.72.49:2375
                docker-compose -f docker-compose-verdaccio.yml up -d --build
                """
            }
        }
    }
}