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
    stage("Build JVM") {
      steps {
        rtGradleRun (
            tool: "gradle",
            rootDir: "java/",
            buildFile: 'build.gradle',
            tasks: '--rerun-tasks build'
        )
      }
    }
    stage("Deploy JVM") {
      steps {
        script {
          def server = Artifactory.server 'artifactory1'
          def uploadSpec = """
            {
              "files": [
                {
                  "pattern": "**/sui-entity/build/libs/sui-entity-${BUILD_NUMBER}.jar",
                  "target": "sui/ru/smsoft/sui/sui-entity/${BUILD_NUMBER}/sui-entity-${BUILD_NUMBER}.jar"
                },
                {
                  "pattern": "**/sui-entity/build/libs/${BUILD_NUMBER}/sui-entity-${BUILD_NUMBER}.pom",
                  "target": "sui/ru/smsoft/sui/sui-entity/${BUILD_NUMBER}/sui-entity-${BUILD_NUMBER}.pom"
                },
                {
                  "pattern": "**/sui-security/build/libs/${BUILD_NUMBER}/sui-security-${BUILD_NUMBER}.jar",
                  "target": "sui/ru/smsoft/sui/sui-security/${BUILD_NUMBER}/sui-security-${BUILD_NUMBER}.jar"
                },
                {
                  "pattern": "**/sui-security/build/libs/${BUILD_NUMBER}/sui-security-${BUILD_NUMBER}.pom",
                  "target": "sui/ru/smsoft/sui/sui-security/${BUILD_NUMBER}/sui-security-${BUILD_NUMBER}.pom"
                },
                {
                  "pattern": "**/sui-meta-schema-service/build/libs/${BUILD_NUMBER}/sui-meta-schema-service-${BUILD_NUMBER}.jar",
                  "target": "sui/ru/smsoft/sui/sui-meta-schema-service/${BUILD_NUMBER}/sui-meta-schema-service-${BUILD_NUMBER}.jar"
                },
                {
                  "pattern": "**/sui-meta-schema-service/build/libs/${BUILD_NUMBER}/sui-meta-schema-service-${BUILD_NUMBER}.pom",
                  "target": "sui/ru/smsoft/sui/sui-meta-schema-service/${BUILD_NUMBER}/sui-meta-schema-service-${BUILD_NUMBER}.pom"
                }
              ]
            }
          """
          server.upload(uploadSpec)
        }
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
