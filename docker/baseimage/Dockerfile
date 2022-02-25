FROM bellsoft/liberica-openjdk-alpine:17.0.2-9

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
