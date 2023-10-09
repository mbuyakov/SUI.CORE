FROM nexus.suilib.ru/adoptopenjdk/openjdk8:jdk8u372-b07-alpine

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

ENV JAVA_TOOL_OPTIONS "-XX:+UseG1GC -XX:MinHeapFreeRatio=5 -XX:MaxHeapFreeRatio=10 -XX:MaxRAMPercentage=90.0"

EXPOSE 8080
