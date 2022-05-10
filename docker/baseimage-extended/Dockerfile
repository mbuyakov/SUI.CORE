FROM nexus.suilib.ru/bellsoft/liberica-openjdk-alpine:17.0.2-9

# https://github.com/AdoptOpenJDK/openjdk-build/issues/693
RUN apk --update add \
    --no-cache \
    fontconfig  \
    ttf-dejavu

# Utilities for file compression
RUN apk --update add \
    --no-cache \
    file \
    imagemagick \
    ghostscript \
    tiff-tools

ENV JAVA_TOOL_OPTIONS "-XX:+UseShenandoahGC -XX:MinHeapFreeRatio=10 -XX:MaxHeapFreeRatio=30"

EXPOSE 8080
