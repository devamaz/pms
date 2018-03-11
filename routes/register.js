const express = require("express");
const register = express.Router();
const crypto = require("crypto");

register.get("/", (req,res) => {
    res.status(200).render("register");
});

register.post("/", (req,res) => {

    const { username, bvn, password, confirm_password } = req.body;

    if ( password !== confirm_password ) {
        res.status(200).render("register", { regerr: "Password Mismatch, the typed in Password does not match Confirmation Password" });
        return;
    }

    const users = req.db.collection("users");

    delete req.body.confirm_password;

    users.findOne({ "$or": [ { username: username }, { bvn : bvn }]}, ( err, result ) => {

        if ( err ) {
            res.status(200).render("register", { regerr: "Unexpected Error, Cannot register you at this time" });
            return ;
        }

        if ( ! result ) {

            req.body.password = crypto.createHash("sha256").update(req.body.password).digest("hex");
            
            users.insert(req.body, ( err, result ) => {
                if ( err ) {
                    res.status(200).render("register", { regerr: "Unexpected Error, Cannot register you at this time" });
                    return ;
                }
                req.session.logedIn = true;
                delete result.password;
                req.session.userCred = result;
                res.status(200).redirect("/");
            });
            return ;
        }

        if ( result.username === username ) {
            res.status(200).render("register", {
                regerr: `User ${username} already exists`
            });
            return ;
        }

        if ( result.bvn === bvn ) {
            res.status(200).render("register", {
                regerr: `Bank Verification Number ${bvn} already exists`
            });
            return ;
        }

        return;
    });
});

module.exports = register;
