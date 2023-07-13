FROM nexus.suilib.ru/openjdk:8-jre-alpine

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

ENV JAVA_TOOL_OPTIONS "-XX:+UseG1GC -XX:MinHeapFreeRatio=5 -XX:MaxHeapFreeRatio=10"

EXPOSE 8080
