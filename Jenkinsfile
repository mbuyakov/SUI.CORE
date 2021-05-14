@Library('smsoft-libs')_

pipeline {
  options {
      buildDiscarder logRotator(numToKeepStr: '3')
      disableConcurrentBuilds()
  }

  parameters {
          booleanParam(defaultValue: true, description: 'Build', name: 'build')
          booleanParam(defaultValue: false, description: 'Clean workspace', name: 'clean_ws')
  }

  agent { label 'master' }

  stages {
    stage("Parralel") {
      when {
        environment name: 'build', value: 'true'
      }
      parallel {
        stage("JVM") {
          environment {
            NEXUS_PASS = credentials('suilib-nexus-pass')
          }
          steps {
            rtGradleRun (
              tool: "gradle-6.3",
              rootDir: "java/",
              buildFile: 'build.gradle',
              tasks: '--rerun-tasks build'
            )
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
        stage("JS") {
          environment {
            NPM_REGISTRY = "https://nexus.suilib.ru/repository/npm-sui/"
            NPM_SCOPE = "@sui"
            NPM_USER = "jenkins"
            NPM_EMAIL = "jenkins@jenkins.jenkins"
            NPM_PASS = credentials('suilib-nexus-pass')
          }
          steps {
            sh """
              cd js
              yarn install --frozen-lockfile
              yarn bootstrap
              yarn ci
              npx npm-cli-adduser
              node ./publish.js 8.0.${BUILD_NUMBER}-${BRANCH_NAME}
            """
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

  post {
    failure {
      telegramSendNotification_v2("@el1191")
    }
  }
}
