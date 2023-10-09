FROM nexus.suilib.ru/docker:20.10.14
RUN echo -e 'https://nexus.suilib.ru/repository/alpine/v3.15/main/\nhttps://nexus.suilib.ru/repository/alpine/v3.15/community' > /etc/apk/repositories && apk update
RUN apk add -v curl nano mc python3 py3-pip git bash
RUN pip install jinja2-cli pyyaml && \
    git config --global --add safe.directory '*'

ENV DOCKER_CONFIG=/.docker
RUN mkdir -p $DOCKER_CONFIG/cli-plugins && \
    curl -SL https://nexus.suilib.ru/repository/github/docker/compose/releases/download/v2.4.1/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose && \
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose && \
    curl -SL https://nexus.suilib.ru/repository/github/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -o /bin/ctop && \
    chmod +x /bin/ctop
