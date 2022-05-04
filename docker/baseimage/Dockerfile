FROM nexus.suilib.ru/bellsoft/liberica-openjdk-alpine:17.0.2-9

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

ENV JAVA_TOOL_OPTIONS "-XX:+UseG1GC -XX:MinHeapFreeRatio=25 -XX:MaxHeapFreeRatio=50"

EXPOSE 8080
