const express = require("express");
const crypto  = require("crypto");
const index = express.Router();


index.get("/", (req,res) => {
    res.status(200).render("index");
});

index.post("/", (req,res) => {
    
    const { username, password } = req.body;
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const users = req.db.collection("users");

    users.findOne({ username },  (err,result) => {
        
        if ( err ) {
            res.status(200).render("index", { err: "Unexpected Error, You Cannot Login now" });
            return ;
        }

        if ( ! result ) {
            res.status(200).render("index", { err: `Invalid Username and/or Password`});
            return; 
        }

        if ( result.username === username && result.password === passwordHash ) {
            req.session.logedIn = true;
            delete req.body.password;
            req.session.userCred = req.body;
            res.status(200).render("index", { succ: true });
            return ;
        }

        res.render("index", { err: `Invalid Username and/or Password`});
        return ;
    });
});

module.exports = index;
