FROM nexus.suilib.ru/node:14.13.1-alpine3.12
RUN npm install -g postgraphile@4.11.0
COPY . .
RUN cd pg-relation-tag-plugin && npm i -g && cd ..
RUN npm install -g postgraphile-plugin-connection-filter@2.1.1 pg-relation-tag-plugin
ENV POSTGRES_PORT 5432
ENV POSTGRES_SCHEMA public,sui_meta,sui_utils,sui_security
ENV POSTGRES_POOL 5
EXPOSE 5000
ENTRYPOINT ["postgraphile", "-n", "0.0.0.0", "--retry-on-init-fail"]
