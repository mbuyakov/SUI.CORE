FROM openjdk:8-jdk-alpine

# Utilities or file compression
RUN apk add --no-cache file
RUN apk --update add imagemagick
RUN apk --update add ghostscript
RUN apk add tiff-tools

# https://github.com/AdoptOpenJDK/openjdk-build/issues/693
RUN apk add --no-cache fontconfig ttf-dejavu
EXPOSE 8080
