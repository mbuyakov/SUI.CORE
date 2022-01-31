FROM openjdk:8-jdk-slim

RUN apt-get update && \
    # Utilities for file compression
    apt-get install -y imagemagick ghostscript libtiff-tools && \
    # https://github.com/AdoptOpenJDK/openjdk-build/issues/693
    apt-get install -y fontconfig fonts-dejavu-core && \
    rm -rf /var/lib/apt/lists/* \

EXPOSE 8080
