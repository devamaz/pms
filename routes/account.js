const express = require("express");
const account = express.Router();

account.get("/", (req,res) => {
    res.status(200).redirect("/account/update_profile");
});

account.get("/update_profile", (req,res) => {
    res.status(200).render("update_profile");
});

account.get("/logout", (req,res) => {
    delete req.session.userCred;
    delete req.session.logedIn;
    res.status(200).redirect("/");
});

account.get("/report_crime", (req,res,next) => {

    const crimelist = req.db.collection("crimelist");

    crimelist.find({}, { _id: 0 , commited: 0, type: 1 }, async (err,result) => {
        if ( err ) {
            res.status(400).render("report_crime", { err: "Unexpected Error while communicating with the database" });
            return ;
        }
        result = await result.toArray();
        res.locals.crimeType = result;
        res.status(200).render("report_crime");
    });
    
});

account.post("/report_crime", async (req,res) => {
    // communicate with databases;
    const crimelist = req.db.collection("crimelist");
    const reportedCrimes = req.db.collection("reportedcrimes");
    const users = req.db.collection("users");
    
    try {
        await reportedCrimes.insert( { crimes: req.body , reportedBy: req.session.userCred.username } );
        await crimelist.updateOne( { type: req.body.crime_type }, { $inc: { commite: 1 } });
        //await users.findOne( { username: req.session.userCred.username } );
        res.status(200).redirect("report_crime");
    } catch(ex) {
        res.status(400).render("report_crime", { err: "Unexpected Error while communicating with the database" });
    }

    
});

module.exports = account;
