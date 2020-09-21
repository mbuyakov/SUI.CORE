@Library('smsoft-libs')_

pipeline {
  options {
      buildDiscarder logRotator(numToKeepStr: '3')
      disableConcurrentBuilds()
  }

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
    stage("Parralel"){
//       when {
//         branch "master"
//       }
      parallel {
        stage("JVM") {
          steps {
            sh """
              asdasdasds
            """
            rtGradleRun (
              tool: "gradle",
              rootDir: "java/",
              buildFile: 'build.gradle',
              tasks: '--rerun-tasks build'
            )
            sh """
              cd java
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-audit/common/build/libs/sui-audit-common-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-audit-common/${BUILD_NUMBER}-${BRANCH_NAME}/sui-audit-common-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-audit/common/build/libs/sui-audit-common-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-audit-common/${BUILD_NUMBER}-${BRANCH_NAME}/sui-audit-common-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-audit/log-mover/build/libs/sui-audit-log-mover-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-audit-log-mover/${BUILD_NUMBER}-${BRANCH_NAME}/sui-audit-log-mover-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-audit/log-mover/build/libs/sui-audit-log-mover-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-audit-log-mover/${BUILD_NUMBER}-${BRANCH_NAME}/sui-audit-log-mover-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-audit/manager/build/libs/sui-audit-manager-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-audit-manager/${BUILD_NUMBER}-${BRANCH_NAME}/sui-audit-manager-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-audit/manager/build/libs/sui-audit-manager-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-audit-manager/${BUILD_NUMBER}-${BRANCH_NAME}/sui-audit-manager-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-backend/build/libs/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-backend/${BUILD_NUMBER}-${BRANCH_NAME}/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-backend/build/libs/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-backend/${BUILD_NUMBER}-${BRANCH_NAME}/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-entity/build/libs/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-entity/${BUILD_NUMBER}-${BRANCH_NAME}/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-entity/build/libs/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-entity/${BUILD_NUMBER}-${BRANCH_NAME}/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-security/build/libs/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-security/${BUILD_NUMBER}-${BRANCH_NAME}/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-security/build/libs/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-security/${BUILD_NUMBER}-${BRANCH_NAME}/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-meta-schema-service/build/libs/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-meta-schema-service/${BUILD_NUMBER}-${BRANCH_NAME}/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-meta-schema-service/build/libs/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-meta-schema-service/${BUILD_NUMBER}-${BRANCH_NAME}/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-user-transaction/build/libs/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-user-transaction/${BUILD_NUMBER}-${BRANCH_NAME}/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-user-transaction/build/libs/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-user-transaction/${BUILD_NUMBER}-${BRANCH_NAME}/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-migration/build/libs/sui-migration-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-migration/${BUILD_NUMBER}-${BRANCH_NAME}/sui-migration-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-migration/build/libs/sui-migration-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-migration/${BUILD_NUMBER}-${BRANCH_NAME}/sui-migration-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-hbase/build/libs/sui-utils-hbase-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-hbase/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-hbase-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-hbase/build/libs/sui-utils-hbase-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-hbase/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-hbase-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-hdfs/build/libs/sui-utils-hdfs-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-hdfs/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-hdfs-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-hdfs/build/libs/sui-utils-hdfs-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-hdfs/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-hdfs-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-kotlin/build/libs/sui-utils-kotlin-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-kotlin/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-kotlin-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-kotlin/build/libs/sui-utils-kotlin-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-kotlin/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-kotlin-${BUILD_NUMBER}-${BRANCH_NAME}.jar
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-parquet/build/libs/sui-utils-parquet-${BUILD_NUMBER}-${BRANCH_NAME}.pom http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-parquet/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-parquet-${BUILD_NUMBER}-${BRANCH_NAME}.pom
              curl -v -X PUT --user jenkins:2wsx2WSX --upload-file ./sui-utils/sui-utils-parquet/build/libs/sui-utils-parquet-${BUILD_NUMBER}-${BRANCH_NAME}.jar http://etp4.sm-soft.ru:8081/artifactory/sui/ru/sui/sui-utils-parquet/${BUILD_NUMBER}-${BRANCH_NAME}/sui-utils-parquet-${BUILD_NUMBER}-${BRANCH_NAME}.jar
            """
          }
        }
        stage("JS") {
          steps {
            sh """
              asdasdasd
              cd js
              yarn
              yarn bootstrap
              yarn ci
              node ./publish.js 8.0.${BUILD_NUMBER}-${BRANCH_NAME}
            """
          }
        }
      }
    }
  }

  post {
    failure {
      telegramSendNotificationTest()
    }
  }
}
