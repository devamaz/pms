const express = require("express");
const register = express.Router();
const crypto = require("crypto");
const gridFs = require("../lib/");

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
    let gridMeth = gridFs(req);

    delete req.body.confirm_password;

    req.body.picture = req.files.picture.name;
    req.__private_PICTURE_DATA = req.files.picture.data;

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

                gridMeth.writeFile( (err,data) => {

                    if ( err ) {
                        res.status(200).render("register", { regerr: "Cannot save image , check the image and try again" });
                        return ;
                    }

                    const users = req.db.collection("users");

                    users.updateOne( { username: req.body.username } , { $set: { file_id: data._id } }, ( err , result ) => {
                        if ( err ) {
                            res.status(200).render("register", { regerr: "Cannot Connect to database" });
                        }
                        req.session.logedIn = true;
                        delete req.body.password;
                        req.session.userCred = req.body;
                        res.status(200).redirect("/");
                    });
                });

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
