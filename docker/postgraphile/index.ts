import express from "express";
import * as pg from "pg";
import {postgraphile} from 'postgraphile';

const devMode = process.env.DEV_MODE.toLowerCase() == "true";
console.log(`devMode: ${devMode}`);

console.log(`maxLimit: ${process.env.MAX_LIMIT}`);

const userIdExtractor = (incomingMessage: { headers: { [x: string]: any; }; }) => {
    return {
        "timezone": "UTC",
        "user.id": incomingMessage.headers["user-id"]
    };
};

const pgPool = new pg.Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
    max: Number(process.env.POSTGRES_POOL)
});

const pgMiddleware = postgraphile(
    pgPool,
    process.env.POSTGRES_SCHEMA.split(","),
    {
        appendPlugins: [require("postgraphile-plugin-connection-filter"), require("./pg-relation-tag-plugin"), require("./pg-limit-plugin")],
        pgSettings: userIdExtractor,
        bodySizeLimit: "100MB",
        enhanceGraphiql: true,
        enableCors: true,
        graphiql: true,
        allowExplain: devMode,
    }
);

const app = express();

app.use(express.json());
app.use((req, res, next) => {
    // console.log(req.body);
    if (!devMode && JSON.stringify(req.body).includes("__schema")) {
        console.log("Invalid query: introspect not allowed");
        res.send({"error": "Introspect not allowed"});
        res.end();
        return;
    }
    next();
});
app.use(async (req, res, next) => {
    // console.log(req.body);
    try {
        const authToken = req.headers.authorization?.replace("Bearer ", "");
        if (!authToken) {
            throw new Error("No token in request");
        }
        const introspectResult = await fetch(process.env.TOKEN_CHECK_URL, {
            method: "POST",
            body: authToken
        });
        const introspectResultBody = await introspectResult.text();
        if (introspectResult.status != 200) {
            throw new Error("Introspect result not 200");
        }
        if (introspectResultBody != "true") {
            throw new Error("Introspect result not true");
        }
    } catch (e: any) {
        console.error("Token check failed", e);
        res.send({"error": "Token check failed: " + e});
        res.end();
        return;
    }
    next();
});
app.use(pgMiddleware);

const server = app.listen(process.env.PORT, () => {
    const address = server.address();
    if (typeof address !== 'string') {
        const href = `http://localhost:${address.port}/graphiql`;
        console.log(`PostGraphiQL available at ${href} 🚀`);
    } else {
        console.log(`PostGraphile listening on port 5000 🚀`);
    }
});
