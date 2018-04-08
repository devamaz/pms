const express = require("express");
const account = express.Router();
const gridFs = require("../lib/");
const crypto = require("crypto");
const magicNumber = require("magic-number");
const cluster = require("cluster");
const os = require("os");
const { ObjectID } = require("mongodb");

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

    const users = req.db.collection("users");
    const gridMeth = gridFs(req);

    gridMeth.readUserProfilePic("users", (err,result) => {
        if ( err ) {
            res.status(400).render("update_profile", { regerr: "Unexpected Error while communicating with the database" });
            return ;
        }
        res.status(200).render("update_profile", { result });
    });

});


account.post("/update_profile", async (req,res) => {

    const gridMeth = gridFs(req);

    const __readAndRedirect = () => {
        gridMeth.readUserProfilePic("users", (err,result) => {
            if ( err ) {
                res.status(200).render("update_profile", { regerr: "Unexpected Error while communicating with the database" });
                return ;
            }
            res.status(200).render("update_profile", { result });
            return ;
        });
    };

    const users = req.db.collection("users");
    const oldPasswordHash = crypto.createHash("sha256").update(req.body.old_password).digest("hex");

    const { password: dbPassword } = await users.findOne({ username: req.session.userCred.username }).catch( ex => {
        return __readAndRedirect();
    });


    if ( oldPasswordHash !== dbPassword ) {
        return __readAndRedirect();
    }

    req.body.password = crypto.createHash("sha256").update(req.body.new_password).digest("hex");

    delete req.body.new_password;
    delete req.body.old_password;

    let  {
        password,
        firstName,
        lastName,
        bvn,
        dob,
        picture
    } = req.body;


    picture = picture !== "" ? picture : (
        await users.findOne({username: req.session.userCred.username}, { _id: 1, picture: 1 })
    );


    const doc = await users.updateOne(
        { username: req.session.userCred.username},
        { $set: { firstName,
                  lastName,
                  bvn,
                  dob,
                  picture,
                  password
                }
        }).catch( ex => {
            __readAndRedirect();
        });


    req.body.picture = req.files.picture.name;
    req.__private_PICTURE_DATA = req.files.picture.data;


    console.log(req.files);

    gridMeth.writeFile( (err,data) => {

        if ( err ) {
            return __readAndRedirect();
        }

        const users = req.db.collection("users");

        users.updateOne( { username: req.session.userCred.username } , { $set: { file_id: data._id } }, ( err , result ) => {
            if ( err ) {
                return __readAndRedirect();
            }
            return __readAndRedirect();
        });
    });

});

account.get("/logout", (req,res) => {
    delete req.session.userCred;
    delete req.session.logedIn;
    res.status(200).redirect("/");
});

account.get("/report_crime", (req,res,next) => {

    const crimelist = req.db.collection("crimelist");
    const users = req.db.collection("users");
    
    crimelist.find({}, { _id: 0 , commited: 0, type: 1 }, async (err,result) => {
        if ( err ) {
            res.status(400).render("report_crime", { err: "Unexpected Error while communicating with the database" });
            return ;
        }
        result = await result.toArray();
        
        res.locals.crimeType = result;
        res.locals.userCred = await users.findOne( { username: req.session.userCred.username } );
        
        req.session.crimeType = res.locals.crimeType;
        
        res.status(200).render("report_crime");
    });

});

account.post("/report_crime", async (req,res) => {

    const crimelist = req.db.collection("crimelist");
    const reportedCrimes = req.db.collection("reportedcrimes");
    const users = req.db.collection("users");
    const cannotConnectDb = () => res.status(400).render("report_crime", { err: "Error while connecting to database" });

    const gridMeth = gridFs(req);

    req.files.crime_scene_image = Array.isArray(req.files.crime_scene_image) ? req.files.crime_scene_image : [ req.files.crime_scene_image ];
    req.files.crime_scene_video = Array.isArray(req.files.crime_scene_video) ? req.files.crime_scene_video : [ req.files.crime_scene_video ];

    res.locals.crimeType = req.session.crimeType;

    const _id = new ObjectID();
    
    await reportedCrimes.insert( { _id , crimes: req.body , reportedBy: req.session.userCred.username } )
        .catch(cannotConnectDb);
    
    for ( let imageFile of req.files.crime_scene_image ) {
        try {
            await gridMeth.writeMediaFile({ type: "image", media: imageFile, _id });
        } catch(ex) {
            console.log(ex);
            return cannotConnectDb();
        }
    }

    for ( let videoFile of req.files.crime_scene_video ) {
        try {
            await gridMeth.writeMediaFile({ type: "videos", media: videoFile, _id });
        } catch(ex) {
            console.log(ex);
            return cannotConnectDb();
        }
    }

    await crimelist.updateOne( { type: req.body.crime_type }, { $inc: { commite: 1 } } )
        .catch(cannotConnectDb);
    
    return res.status(200).render("report_crime");
});

account.get("/crime_reported", (req,res) => {

    const { username } = req.session.userCred;
    const reportedCrimes = req.db.collection("reportedcrimes");
    const projection = { _id: 0, reportedBy: 0 };

    let returnData, json ;

    if ( ! req.xhr ) {
        returnData = reportedCrimes.find( { reportedBy: username }, projection )// .limit(req.session._private_mongo_LIMITAMOUNT)
        ;
        json = false;
    } else {
        returnData = reportedCrimes.find( { reportedBy: username }, projection ).skip(req.session._private_mongo_SKIPAMOUNT)// .limit(req.session._private_mongo_LIMITAMOUNT) //
        ;
        json = true;
    }

    req.session._private_mongo_SKIPAMOUNT += req.session._private_mongo_LIMITAMOUNT + req.session._private_mongo_SKIPAMOUNT;

    returnData.toArray().then( crime => {

        if ( crime.length === 0 ) {
            res.render("crime_reported", { no_crime: "No Crime Has Been Reported Yet" });
            return;
        }


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
