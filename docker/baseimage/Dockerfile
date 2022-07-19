FROM nexus.suilib.ru/bellsoft/liberica-openjdk-alpine:17.0.2-9

# https://github.com/AdoptOpenJDK/openjdk-build/issues/693
RUN apk --update add \
    --no-cache \
    fontconfig  \
    ttf-dejavu

ENV JAVA_TOOL_OPTIONS "-XX:+AlwaysActAsServerClassMachine -XX:+UseShenandoahGC -XX:MinHeapFreeRatio=10 -XX:MaxHeapFreeRatio=30"

EXPOSE 8080
