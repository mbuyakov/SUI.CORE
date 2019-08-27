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
        stage ('Artifactory configuration') {
                    steps {
                        rtGradleDeployer (
                            id: "GRADLE_DEPLOYER",
                            serverId: "artifactory1",
                            repo: "lib-release-local",
                        )
                    }
                }
        stage("Build JVM") {
//           when {
//               branch "master"
//           }
            steps {
              rtGradleRun (
                  tool: "gradle",
                  rootDir: "java/",
                  buildFile: 'build.gradle',
                  tasks: 'clean artifactoryPublish',
                  deployerId: "GRADLE_DEPLOYER"
              )
            }
        }
        stage("Build JS") {
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
        stage("Deploy JS master") {
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
