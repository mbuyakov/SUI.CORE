FROM openjdk:8-jre-alpine

# Utilities for file compression
# https://github.com/AdoptOpenJDK/openjdk-build/issues/693
RUN apk --update add \
    --no-cache \
    file \
    imagemagick \
    ghostscript \
    tiff-tools \
    fontconfig  \
    ttf-dejavu

EXPOSE 8080
