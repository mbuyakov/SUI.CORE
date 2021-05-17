pipeline {
  options {
    buildDiscarder logRotator(numToKeepStr: '3')
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(defaultValue: true, description: 'Build JVM', name: 'build_jvm')
    booleanParam(defaultValue: true, description: 'Build JS', name: 'build_js')
    booleanParam(defaultValue: false, description: 'Clean workspace', name: 'clean_ws')
  }

  agent { label 'master' }

  stages {
    stage("Parralel") {
      parallel {
        stage("JVM") {
          when {
            environment name: 'build_jvm', value: 'true'
          }
          agent {
            docker {
              image 'gradle:6.7-jdk8'
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
                NEXUS_PASS = credentials('suilib-nexus-pass')
              }
              steps {
                sh """
                  cd java
                  sh ./upload.sh sui-audit-common sui-audit/common
                  sh ./upload.sh sui-audit-log-mover sui-audit/log-mover
                  sh ./upload.sh sui-audit-manager sui-audit/manager
                  sh ./upload.sh sui-backend
                  sh ./upload.sh sui-entity
                  sh ./upload.sh sui-security-base sui-security/base
                  sh ./upload.sh sui-security-server sui-security/server
                  sh ./upload.sh sui-meta-schema-service
                  sh ./upload.sh sui-user-transaction
                  sh ./upload.sh sui-migration
                  sh ./upload.sh sui-utils-hbase sui-utils/sui-utils-hbase
                  sh ./upload.sh sui-utils-hdfs sui-utils/sui-utils-hdfs
                  sh ./upload.sh sui-utils-kotlin sui-utils/sui-utils-kotlin
                  sh ./upload.sh sui-utils-parquet sui-utils/sui-utils-parquet
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
                SUFFIX = "${env.BRANCH_NAME == "master" ? " " : ("-" + env.BRANCH_NAME)}"
              }
              steps {
                sh """
                  npx npm-cli-adduser
                  cd js
                  node ./publish.js 8.0.${BUILD_NUMBER}${SUFFIX}
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
