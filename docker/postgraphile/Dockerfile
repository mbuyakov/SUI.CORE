FROM nexus.suilib.ru/node:20
COPY . .
RUN yarn install --frozen-lockfile
ENV POSTGRES_PORT 5432
ENV POSTGRES_SCHEMA public,sui_meta,sui_utils,sui_security
ENV POSTGRES_POOL 5
ENV PORT 5000
EXPOSE 5000
ENTRYPOINT ["yarn", "start"]
