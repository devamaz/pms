const express = require("express");
const pug = require("pug");
const favicon = require("serve-favicon");
const mongodb = require("mongodb");
const compileSass = require("express-compile-sass");
const compression = require("compression");
const bodyParser = require("body-parser");
const path = require("path");
const admin = require("./routes/admin.js");
const user = require("./routes/user.js");
const app = express();

const dotenv = require("dotenv").config();

const {
    DB_USER,
    DB_PWD,
    DB_HOST
} = process.env;

app.use(async (req,res,next) => {
    req.db = await mongodb.connect(
        `mongodb://${DB_USER}:${DB_PWD}@${DB_HOST}/pms`
    );
    next();
});

app.use( compileSass({
    root: path.join(__dirname, "public"),
    sourceMap: true,
    sourceComments: true,
    watchFiles: true,
    logToConsole: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.set("views", path.join(__dirname, "views"));
app.set("PORT", process.env.PORT || 1300);
app.set("env", process.env.NODE_ENV || "development");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "assets", "police_logo.jpeg")));

app.get("/", (req,res) => {
    res.status(200)
        .render("index");
});

app.use("/admin", admin);
app.use("/users", user);

app.use("*", (req,res,next) => {
    next(new Error());
});

app.use( (err,req,res ) => {
    // log or render error
    res.status(400).json({
        err
    });
});

app.listen(app.get("PORT"), () => {
    console.log("Listening on port %s", app.get("PORT"));
});
