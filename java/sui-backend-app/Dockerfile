FROM openjdk:8-jdk-alpine
LABEL maintainer="el1191@woyd.ru"
ARG JAR_FILE=./build/libs/*.jar
ADD ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
EXPOSE 8080