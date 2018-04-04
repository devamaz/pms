const express = require("express");
const pug = require("pug");
const favicon = require("serve-favicon");
const mongodb = require("mongodb");
const compileSass = require("express-compile-sass");
const compression = require("compression");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo")(expressSession);
const bodyParser = require("body-parser");
const expressFileUpload = require("express-fileupload");
const path = require("path");
const admin = require("./routes/admin.js");
const user = require("./routes/user.js");
const index = require("./routes/index.js");
const register = require("./routes/register.js");
const account = require("./routes/account.js");

const app = express();

const dotenv = require("dotenv").config();

const {
    DB_USER,
    DB_PWD,
    DB_HOST,
    SECRET: secret
} = process.env;

const mongoClient = async () => await mongodb(
    `mongodb://${DB_USER}:${DB_PWD}@${DB_HOST}/pms`
);

app.use(expressFileUpload({
    safeFileNames: true
}));

app.use(async (req,res,next) => {
    req.mongoClient = await mongoClient();
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

app.use( expressSession({
    secret,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({url: `mongodb://${DB_USER}:${DB_PWD}@${DB_HOST}/pms`})
}) );

app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.set("views", path.join(__dirname, "views"));
app.set("PORT", process.env.PORT || 1300);
app.set("env", process.env.NODE_ENV || "development");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "assets", "police_logo.jpeg")));

app.use(async (req,res,next) => {
    
    if ( req.session.logedIn ) {
        res.locals.succ = true;
        res.locals.userCred = req.session.userCred;
        
        const reportedCrimes = req.db.collection("reportedcrimes");
        
        let err;
        
        try {
            reportedCrimes.aggregate([
                {
                    $group: {
                        _id: "$reportedBy",
                        reportedCrimes: { $sum: 1 }
                    }
                },
                {
                    $out: "tempCollection"
                }
            ]);
            
            const tempCollection = req.db.collection("tempCollection");
            const result = await tempCollection.findOne({ _id: req.session.userCred.username });
            
            res.locals.reportedCrimes = result ? result.sum : 0;
            
        } catch(ex) {
            err = ex;
        } finally {
            if ( Error[Symbol.hasInstance](err) ) {
                next(new Error());
            } else {
                next();
            }
        }
        
    } else {
        next();
    }
});

app.use("/", index);
app.use("/admin", admin);
app.use("/users", user);
app.use("/register", register);
app.use("/account", account);

app.use("*", (req,res,next) => {
    next(new Error());
});

app.use( (err,req,res ) => {
    // log or render error
    res.status(500).json({
        err
    });
});

process.on("UnhandledPromiseReject", err => {
    console.log(err);
});

app.listen(app.get("PORT"), () => {
    console.log("Listening on port %s", app.get("PORT"));
});

