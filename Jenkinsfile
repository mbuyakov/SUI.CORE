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
    stage("Parralel"){
//       when {
//         branch "master"
//       }
      parallel {
        stage("JVM") {
          steps {
            rtGradleRun (
              tool: "gradle",
              rootDir: "java/",
              buildFile: 'build.gradle',
              tasks: '--rerun-tasks build'
            )
            script {
              def server = Artifactory.server 'artifactory1'
              def uploadSpec = """
                {
                  "files": [
                    {
                      "pattern": "**/sui-entity/build/libs/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.jar",
                      "target": "sui/ru/smsoft/sui/sui-entity/${BUILD_NUMBER}-${BRANCH_NAME}/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.jar"
                    },
                    {
                      "pattern": "**/sui-entity/build/libs/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.pom",
                      "target": "sui/ru/smsoft/sui/sui-entity/${BUILD_NUMBER}-${BRANCH_NAME}/sui-entity-${BUILD_NUMBER}-${BRANCH_NAME}.pom"
                    },
                    {
                      "pattern": "**/sui-security/build/libs/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.jar",
                      "target": "sui/ru/smsoft/sui/sui-security/${BUILD_NUMBER}-${BRANCH_NAME}/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.jar"
                    },
                    {
                      "pattern": "**/sui-security/build/libs/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.pom",
                      "target": "sui/ru/smsoft/sui/sui-security/${BUILD_NUMBER}-${BRANCH_NAME}/sui-security-${BUILD_NUMBER}-${BRANCH_NAME}.pom"
                    },
                    {
                      "pattern": "**/sui-meta-schema-service/build/libs/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.jar",
                      "target": "sui/ru/smsoft/sui/sui-meta-schema-service/${BUILD_NUMBER}-${BRANCH_NAME}/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.jar"
                    },
                    {
                      "pattern": "**/sui-meta-schema-service/build/libs/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.pom",
                      "target": "sui/ru/smsoft/sui/sui-meta-schema-service/${BUILD_NUMBER}-${BRANCH_NAME}/sui-meta-schema-service-${BUILD_NUMBER}-${BRANCH_NAME}.pom"
                    },
                    {
                      "pattern": "**/sui-user-transaction/build/libs/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.jar",
                      "target": "sui/ru/smsoft/sui/sui-user-transaction/${BUILD_NUMBER}-${BRANCH_NAME}/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.jar"
                    },
                    {
                      "pattern": "**/sui-user-transaction/build/libs/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.pom",
                      "target": "sui/ru/smsoft/sui/sui-user-transaction/${BUILD_NUMBER}-${BRANCH_NAME}/sui-user-transaction-${BUILD_NUMBER}-${BRANCH_NAME}.pom"
                    },
                    {
                      "pattern": "**/sui-backend/build/libs/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.jar",
                      "target": "sui/ru/smsoft/sui/sui-backend/${BUILD_NUMBER}-${BRANCH_NAME}/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.jar"
                    },
                    {
                      "pattern": "**/sui-backend/build/libs/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.pom",
                      "target": "sui/ru/smsoft/sui/sui-backend/${BUILD_NUMBER}-${BRANCH_NAME}/sui-backend-${BUILD_NUMBER}-${BRANCH_NAME}.pom"
                    }
                  ]
                }
              """
              server.upload(uploadSpec)
            }
          }
        }
        stage("JS") {
          steps {
            sh """
              cd js/SUI.ALL
              yarn install
              yarn ci
              yarn publish --registry http://verdaccio.smp.sm-soft.ru/ --non-interactive --new-version 6.0.${BUILD_NUMBER}-${BRANCH_NAME}-${BRANCH_NAME}
            """
          }
        }
      }
    }
  }
}
