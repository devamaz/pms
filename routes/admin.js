const express = require("express");

const admin = express.Router();


admin.get("/", ( req, res, next ) => {
    if ( req.session.____AdminLogedIn____ ) {
        next();
    } else {
        res.status(200).render("admin_login");
    }
});

admin.post("/", ( req, res ) => {
    res.end("done");
});

admin.use((req,res,next) => {
    if ( req.session.____AdminLogedIn____ ) {
        next();
    } else {
        res.locals.err = "You are not authorized to view this section";
        res.status(200).render("index");
    }

});

module.exports = admin;
