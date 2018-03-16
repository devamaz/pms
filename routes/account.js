const express = require("express");
const account = express.Router();


account.use((req,res,next) => {
    if ( req.session.logedIn ) {
        req.session._private_mongo_LIMITAMOUNT = 3;
        req.session._private_mongo_SKIPAMOUNT = req.session._private_mongo_SKIPAMOUNT ? req.session._private_mongo_SKIPAMOUNT : 0;
        next();
    } else {
        res.locals.err = "You are not authorized to view this section";
        res.status(200).render("index");
    }
});

account.use((req,res,next) => {
    if ( ! req.xhr ) {
        delete req.session._private_mongo_SKIPAMOUNT;
    }
    next();
});

account.get("/", (req,res,next) => {
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

account.get("/crime_reported", (req,res) => {

    const { username } = req.session.userCred;
    const reportedCrimes = req.db.collection("reportedcrimes");
    const projection = { _id: 0, reportedBy: 0 };

    let returnData, json ;

    if ( ! req.xhr ) {
        returnData = reportedCrimes.find( { reportedBy: username }, projection ).limit(req.session._private_mongo_LIMITAMOUNT);
        json = false;
    } else {
        returnData = reportedCrimes.find( { reportedBy: username }, projection ).skip(req.session._private_mongo_SKIPAMOUNT).limit(req.session._private_mongo_LIMITAMOUNT);
        json = true;
    }


    req.session._private_mongo_SKIPAMOUNT += req.session._private_mongo_LIMITAMOUNT + req.session._private_mongo_SKIPAMOUNT;

    returnData.toArray().then( crime => {

        let isFin  = 0;

        if ( crime.length === 0 ) {
            delete req.session._private_mongo_LIMITAMOUNT;
            delete req.session._private_mongo_SKIPAMOUNT;
            isFin = 1;
        }

        if ( ! json ) {
            res.status(200).render("crime_reported", { crime });
            return ;
        }
        
        if ( isFin ) {
            res.status(200).json({ crerr: "No More" });
            return ;
        }
        res.status(200).json({ crime });
    });

});

module.exports = account;
