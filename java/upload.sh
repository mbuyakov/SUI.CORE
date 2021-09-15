set -e
set -x

if [ -z "$BUILD_NUMBER" ]; then
  echo "No BUILD_NUMBER specified"
  exit 1
fi

if [ -z "$1" ]; then
  echo "No subproject specified"
  exit 1
fi
SUBPROJECT="$1"

if [ -z "$2" ]; then
  echo "No folder specified. Using subproject name"
  FOLDER="$1"
else
  FOLDER="$2"
fi

curl -v -X PUT --user jenkins:${NEXUS_PASS} --upload-file ./${FOLDER}/build/libs/${SUBPROJECT}-${BUILD_NUMBER}${SUFFIX}.jar https://nexus.suilib.ru/repository/mvn-sui/ru/sui/${SUBPROJECT}/${BUILD_NUMBER}${SUFFIX}/${SUBPROJECT}-${BUILD_NUMBER}${SUFFIX}.jar
curl -v -X PUT --user jenkins:${NEXUS_PASS} --upload-file ./${FOLDER}/build/libs/${SUBPROJECT}-${BUILD_NUMBER}${SUFFIX}-sources.jar https://nexus.suilib.ru/repository/mvn-sui/ru/sui/${SUBPROJECT}/${BUILD_NUMBER}${SUFFIX}/${SUBPROJECT}-${BUILD_NUMBER}${SUFFIX}-sources.jar
curl -v -X PUT --user jenkins:${NEXUS_PASS} --upload-file ./${FOLDER}/build/libs/${SUBPROJECT}-${BUILD_NUMBER}${SUFFIX}.pom https://nexus.suilib.ru/repository/mvn-sui/ru/sui/${SUBPROJECT}/${BUILD_NUMBER}${SUFFIX}/${SUBPROJECT}-${BUILD_NUMBER}${SUFFIX}.pom
