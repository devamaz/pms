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

index.get("/news", async ( req , res ) => {
    return res.status(200).redirect("/news/1");
});

index.get("/news/:section", async ( req , res ) => {

    const news = req.db.collection("news");
    const sectionNum = Number(req.params.section);
    const section = Number.isInteger(sectionNum)
          ? sectionNum
          : (() => res.status(200).render("error", { err: "requested page not found "}))();

    const { limit, skip } = { limit: 12 , skip: ( section === 1 ? 0 : ( 12 * section ) / 2 ) };

    let result, count ;

    try {
        result = await news.find({}).sort({ $natural: -1 }).skip(skip).limit(12).toArray();
        count = await news.find({}).count();
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render("readnews", { err: "cannot connect to database" });

        let length = Math.ceil(count / 12);
        
        if ( result.length === 0 ) {
            return res.status(200).render("readnews", { nomore: "nothing to display here" , more: { length } });
        }
        
        return res.status(200).render("readnews", { result, more: { current: sectionNum, length }  });
    }

});

module.exports = index;
