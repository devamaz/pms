const express = require("express");
const crypto = require("crypto");
const admin = express.Router();


admin.get("/", ( req, res, next ) => {
    if ( req.session.____AdminLogedIn____ ) {
        res.status(200).render("admin");
    } else {
        res.status(200).render("adminlogin");
    }
});

admin.post("/", async (req,res,next) => {

    let { adm_username: username, adm_password: password } = req.body;
    const admin = req.db.collection("admin");

    password = crypto.createHash("md5").update(password).digest("hex");

    let result;

    try {
        result = await admin.findOne({ username, password });
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) ) {
            res.render(200).render("adminlogin", { err: "Error communicating with database" });
            return;
        }

        if ( ! result ) {
            next();
            return;
        }

        req.session.____AdminLogedIn____ = true;
        res.status(200).render("admin");
    }

});


admin.use((req,res,next) => {
    if ( req.session.____AdminLogedIn____ ) {
        next();
    } else {
        res.locals.err = "You are not authorized to view the admin section";
        res.status(200).render("adminlogin");
    }

});

admin.get("/logout", ( req, res ) => {
    delete req.session.____AdminLogedIn____;
    res.status(200).redirect("/admin");
});

module.exports = admin;
