const express = require("express");
const pug = require("pug");
const favicon = require("serve-favicon");
const mongodb = require("mongodb");
const compileSass = require("express-compile-sass");
const compression = require("compression");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const path = require("path");
const admin = require("./routes/admin.js");
const user = require("./routes/user.js");
const index = require("./routes/index.js");
const app = express();

const dotenv = require("dotenv").config();

const {
    DB_USER,
    DB_PWD,
    DB_HOST
} = process.env;

app.use(async (req,res,next) => {
    req.mongoClient = await mongodb(
        `mongodb://${DB_USER}:${DB_PWD}@${DB_HOST}/pms`
    );
    req.db = req.mongoClient.db("pms");
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

app.use("/", index);
app.use("/admin", admin);
app.use("/users", user);

app.get("/register", (req,res) => {
    res.status(200).render("register");
});

app.post("/register", (req,res) => {

    const { username, bvn, password, confirm_password } = req.body;
    console.log(password, confirm_password);
    if ( password !== confirm_password ) {
        res.status(200).render("register", { err: "Password Mismatch, the typed in Password does not match Confirmation Password" });
        return;
    }

    const users = req.db.collection("users");

    delete req.body.confirm_password;
    
    users.findOne({ "$or": [ { username: username }, { bvn : bvn }]}, ( err, result ) => {

        if ( err ) {
            res.status(200)
                .render("register", { err: "Unexpected Error, Cannot register you at this time" });
            return ;
        }

        if ( ! result ) {
            
            req.body.password = crypto.createHash("sha256").update(req.body.password).digest("hex");
            
            users.insert(req.body, ( err, result ) => {
                if ( err ) {
                    res.status(200)
                        .render("register", { err: "Unexpected Error, Cannot register you at this time" });
                    return ;
                }
                res.status(200)
                    .redirect("/", { succ: true } );
            });
            return ;
        }

        if ( result.username === username ) {
            res.status(200)
                .render("register", {
                    err: `User ${username} already exists`
                });
            return ;
        }

        if ( result.bvn === bvn ) {
            res.status(200)
                .render("register", {
                    err: `Bank Verification Number ${bvn} already exists`
                });
            return ;
        }

        return;
    });
});

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
