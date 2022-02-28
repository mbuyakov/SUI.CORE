pipeline {
  options {
    buildDiscarder logRotator(numToKeepStr: '3')
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(defaultValue: true, description: 'Build Docker', name: 'build_docker')
    booleanParam(defaultValue: true, description: 'Build JVM', name: 'build_jvm')
    booleanParam(defaultValue: true, description: 'Build JS', name: 'build_js')
    booleanParam(defaultValue: false, description: 'Clean workspace', name: 'clean_ws')
  }

  environment {
    SUFFIX = "${env.BRANCH_NAME == "master" ? " " : ("-" + env.BRANCH_NAME)}"
  }

  agent any

  stages {
    stage("Parralel") {
      parallel {
        stage("Docker") {
          when {
            environment name: 'build_docker', value: 'true'
          }
          stages {
            stage("[Docker] Build") {
              steps {
                sh """
                  cd docker
                  docker build -t nexus.suilib.ru:10400/repository/docker-sui/sui-baseimage:${BUILD_NUMBER}${SUFFIX} baseimage
                  docker build -t nexus.suilib.ru:10400/repository/docker-sui/sui-postgraphile:${BUILD_NUMBER}${SUFFIX} postgraphile
                """
              }
            }
            stage("[Docker] Publish") {
              environment {
                NEXUS = credentials('suilib-nexus')
              }
              steps {
                sh """
                  docker login nexus.suilib.ru:10400/repository/docker-sui/ --username ${NEXUS_USR} --password ${NEXUS_PSW}
                  docker push nexus.suilib.ru:10400/repository/docker-sui/sui-baseimage:${BUILD_NUMBER}${SUFFIX}
                  docker push nexus.suilib.ru:10400/repository/docker-sui/sui-postgraphile:${BUILD_NUMBER}${SUFFIX}
                """
              }
              post {
                always {
                  sh """
                    docker logout nexus.suilib.ru:10400/repository/docker-sui/
                  """
                }
              }
            }
          }
        }
        stage("JVM") {
          when {
            environment name: 'build_jvm', value: 'true'
          }
          agent {
            docker {
              image 'gradle:7.4-jdk8'
              reuseNode true
              args '-e HOME=$HOME'
            }
          }
          stages {
            stage("[JVM] Build") {
              steps {
                sh """
                  cd java
                  gradle build
                """
              }
            }
            stage("[JVM] Publish") {
              environment {
                ORG_GRADLE_PROJECT_nexusUsername = "nexus"
                ORG_GRADLE_PROJECT_nexusPassword = credentials('suilib-nexus-pass')
              }
              steps {
                sh """
                  cd java
                  gradle publish
                """
              }
            }
          }
        }
        stage("JS") {
          when {
            environment name: 'build_js', value: 'true'
          }
          agent {
            docker {
              image 'node:14-alpine'
              reuseNode true
              args '-e HOME=$HOME'
            }
          }
          stages {
            stage("[JS] Install dependencies") {
              steps {
                sh """
                  cd js
                  yarn install --frozen-lockfile
                  yarn bootstrap
                """
              }
            }
            stage("[JS] Build") {
              steps {
                sh """
                  cd js
                  yarn ci
                """
              }
            }
            stage("[JS] Publish") {
              environment {
                NPM_REGISTRY = "https://nexus.suilib.ru/repository/npm-sui/"
                NPM_SCOPE = "@sui"
                NPM_USER = "jenkins"
                NPM_EMAIL = "jenkins@jenkins.jenkins"
                NPM_PASS = credentials('suilib-nexus-pass')
              }
              steps {
                sh """
                  npx npm-cli-adduser
                  cd js
                  yarn lcm publish 9.0.${BUILD_NUMBER}${SUFFIX}
                """
              }
            }
          }
        }
      }
    }

    stage('Clean workspace') {
      when {
        environment name: 'clean_ws', value: 'true'
      }

      steps {
        cleanWs()
      }
    }
  }
}
