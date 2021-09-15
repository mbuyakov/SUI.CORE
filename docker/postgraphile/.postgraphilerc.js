const userIdExtractor = incomingMessage => {
  return {
    "timezone": "UTC",
    "user.id": incomingMessage.headers["user-id"]
  };
};

module.exports = {
  options: {
    appendPlugins: ["postgraphile-plugin-connection-filter", "pg-relation-tag-plugin"],
    pgSettings: userIdExtractor,
    connection: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASS}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
    cors: true,
    schema: process.env.POSTGRES_SCHEMA.split(","),
    watch: true,
    bodySizeLimit: "100MB",
    maxPoolSize: Number(process.env.POSTGRES_POOL)
  },
};
