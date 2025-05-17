import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import routers from "./routes/index.js";

const app = express();

// View engine
app.set("views", path.resolve("src/views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 60 * 1000,
            secure: false,
        },
    })
);

app.use(express.json());
app.use(routers);

export default app;
