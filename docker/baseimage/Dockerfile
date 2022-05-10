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

ENV JAVA_TOOL_OPTIONS "-XX:+UseShenandoahGC -XX:MinHeapFreeRatio=10 -XX:MaxHeapFreeRatio=30"

EXPOSE 8080
