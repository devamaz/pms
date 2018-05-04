const express = require("express");
const crypto = require("crypto");
const gridFs = require("../lib/");
const policeHandlers = require("../lib/police_actions.js");
const criminalsHandlers = require("../lib/criminal_handler.js");
const cluster = require("cluster");
const os = require("os");
const { ObjectId } = require("mongodb");
const admin = express.Router();


admin.get("/", ( req, res, next ) => {
    if ( req.session.____AdminLogedIn____ ) {
        res.status(200).render("admin");
    } else {
        res.status(200).redirect("/admin/adminlogin");
    }
});

admin.get("/adminlogin", (req,res) => {
    res.status(200).render("adminlogin");
});

admin.post("/adminlogin", async (req,res,next) => {

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

admin.get("/police", async (req,res) => {


    if ( req.xhr )
        return policeHandlers.transferGetHandler(req,res);

    const police = req.db.collection("police.officers");
    const stations = req.db.collection("police.stations");

    let police_result, stations_result, result ;

    try {

        result = police_result = await police.find({ }, { _id: 0 }).toArray();
        result = stations_result = await stations.find( { }, { _id: 0, station_address: 0}).toArray();

    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render("police",{ err: "Cannot Retrieve Police Information" } );

        if ( ! police_result.length )
            return res.status(200).render("police",{ noresult: "No officer in Database"} );

        if ( ! stations_result.length )
            return res.status(200).render("police", { noresult: "Create a police station to continue" } );
        
        const gridMeth = gridFs(req);

        gridMeth.itereateValues(police_result, async (policeinfo) => {
            policeinfo = await policeinfo;
            res.status(200).render("police", { policeinfo, stations_result } );
        });
    }


});

admin.get("/police/search",  async ( req, res ) => {

    const police = req.db.collection("police.officers");
    const { search_type, search_str } = req.query;
    const regex = new RegExp(`${search_str}`, "g");
    console.log(regex, search_type, search_str);
    let result;

    try {

        if ( search_type === "firstName" )
            result = await police.find( { $or: [ { firstName: regex }, { lastName: regex } ] }).toArray();
        else
            result = await police.find( { [search_type]: regex } ).toArray();

    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json( { err: "error connecting to database" } );

        if ( result.length === 0 )
            return res.status(200).json( { noresult: "no search found" } );

        const gridMeth = gridFs(req);
        gridMeth.itereateValues(result, async (policeinfo) => {
            policeinfo = await policeinfo;
            res.status(200).json({ policeinfo });
        });
    }
});


admin.post("/police", async (req,res) => {

    if ( req.xhr && ! req.body.casen )
        return policeHandlers.transferPostHandler(req,res);

    if ( req.xhr && req.body.casen )
        return policeHandlers.assignPostHandler(req,res);

    const police = req.db.collection("police.officers");

    const {
        police_firstname: firstName,
        police_lastname: lastName,
        police_servicenumber: serviceNo,
        police_dateofbirth: dateOfBirth,
        police_commencementdate: commencementDate,
        picture = req.files.picture.name,
        assignedTo = [],
        station
    } = req.body;


    const gridMeth = gridFs(req);

    req.body.picture = req.files.picture.name;
    req.__private_PICTURE_DATA = req.files.picture.data;

    gridMeth.writeFile( ( err, data ) => {

        if ( err ) {
            res.status(200).render("police", { err: "Cannot create police data" });
            return ;
        }

        police.insertOne( {
            firstName,
            lastName,
            serviceNo,
            dateOfBirth,
            commencementDate,
            picture,
            station,
            serviceNo ,
            file_id: data._id,
            assignedTo
        }, async ( err, result ) => {

            if ( err ) {
                res.status(200).render("police", { err: "Cannot create police data" } );
                return ;
            }

            res.status(200).redirect("/admin/police");
        });
    });


});

admin.delete("/police", async (req,res) => {

    if ( ! req.xhr )
        return res.status(200).json( { done: false } );

    return policeHandlers.deleteHandler(req,res);
});


admin.get("/cases", async ( req, res) => {

    const reportedCrimes = req.db.collection("reportedcrimes");

    let result;

    try {

        result = await reportedCrimes.find({}).sort({ $natural: -1 }).toArray();

    } catch(ex) {

        result = ex;

    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render("cases", { err: "cannot connect to db to retrieve reported crime" });

        if ( result.length === 0 )
            return res.status(200).render("cases", { err: "no crime have been reported yet" });

        return res.status(200).render("cases", { cases: result } );
    }
});

admin.post("/cases", async (req,res) => {

    const { state, _id } = req.body;
    const reportedCrimes = req.db.collection("reportedcrimes");


    let result ;

    try {

        result = await reportedCrimes.update({ _id }, { $set: { state } } ) ;

    } catch(ex) {

        result = ex;

    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json({ done: false });

        return res.status(200).json({ done: true } );

    }
});


admin.get("/cases/case_number", async (req,res) => {

    if ( ! req.xhr )
        return res.status(200).json( { done: false } );

    const reportedCrimes = req.db.collection("reportedcrimes");

    let { casen } = req.query;
    let result ;

    try {

        if ( /^s{0,}$/.test(casen) )
            casen = null;

        result = await reportedCrimes.find( { case_number: new RegExp(`^${casen}`) } ).toArray();

    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json({ cerr: "cannot connect to db" });

        return res.status(200).json( { result } );
    }

});

admin.post("/cases/setstate", async ( req, res) => {

    if ( ! req.xhr )
        return res.status(200).render("error", { err: "You can only access this section with an xhr request"} );

    const { _id } = req.query;
    const { state } = req.body;

    const reportedCrimes = req.db.collection("reportedcrimes");

    let result ;

    try {
        result = await reportedCrimes.update({ _id: ObjectId(_id) }, { $set: { state: state.toLowerCase() } });
    } catch(ex) {
        result = ex;
    } finally {
        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json({ err: "Cannot service request" });

        const state = (await reportedCrimes.findOne({ _id: ObjectId(_id) })).state;

        return res.status(200).json({
            state,
            class: `crime_${state}`
        });
    }

});

admin.get("/cases/getmedia", async ( req, res ) => {

    if ( ! req.xhr )
        return res.status(200).render("error", { err: "You can only access this section with an xhr request"} );

    const { _id } = req.query;
    const reportedCrimes = req.db.collection("reportedcrimes");

    let result;

    try {
        result = await reportedCrimes.findOne( { _id: ObjectId(_id) } );
    } catch(ex) {
        result = ex;
    } finally {
    }

    if ( Error[Symbol.hasInstance](result) ) {
        return res.status(200).json({ err: "cannot retrieve information" });
    }

    const gridMeth = gridFs(req);

    gridMeth.readCasesMedia(result, ({buf,name}) => {
        console.log("a");
    });

    console.log("b");
});


admin.get("/criminal", async (req,res) => {

    if ( req.xhr ) {
        return criminalsHandlers.criminalGetHandler(req,res);
    }

    const criminals = req.db.collection("criminal.criminalinfo");

    let result;

    try {
        result = await criminals.find({}).toArray();
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render("criminal", { err: "cannot connect to database" } );

        if ( result.length === 0 )
            return res.status(200).render("criminal", { noresult: "No criminal recrod in database" } );

        return res.status(200).render("criminal", { criminals: result });
    }

});


admin.post("/criminal", async (req,res) => {

    const criminals = req.db.collection("criminal.criminalinfo");

    const {
        criminal_firstname: firstName,
        criminal_lastname: lastName,
        service_no: officer_in_charge,
        criminal_id,
        station,
        jail_number
    } = req.body;

    let result;

    try {

        result = await criminals.insert( {
            firstName,
            lastName,
            criminal_id,
            commited_crimes: [{
                crime_commited: "",
                convicted_times: 1,
                station_info: [{
                    station,
                    officer_in_charge,
                    date_imprisoned: new Date(),
                    jail_number
                }]
            }]
        });

    } catch(ex) {

        result = ex;

    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render("criminal", { err: "cannot connect to database" } );

        return res.status(200).redirect("/admin/criminal");
    }
});


admin.get("/news", async ( req , res ) => {

    const news = req.db.collection("news");

    let result;

    try {
        result = await news.find({}).sort( { $natural: -1 } ).toArray();
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render("news", { err: "cannot connect to database" });

        if ( result.length === 0 )
            return res.status(200).render("news", { noresult: "No news in database" });

        return res.status(200).render("news", { result });

    }
});

admin.post("/news", async ( req , res ) => {

    const news = req.db.collection("news");
    const { title, content, date = new Date() } = req.body;

    let result ;

    try {

        result = await news.find({}).count();
        result = await news.insert({ title, content, date, news_count: result });

    } catch(ex) {

        result = ex;

    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render("news", { err: "cannot connect to database" });

        return res.status(200).redirect("/admin/news");
    }

});

admin.delete("/news", async ( req , res ) => {

    const news = req.db.collection("news");
    const { delete_num } = req.body;

    let result, news_count = Number(delete_num);

    try {
        result = await news.findOneAndDelete( { news_count } );
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json( { done: false } );

        return res.status(200).json( { done: true } );
    }
});

admin.get("/station", async ( req , res ) => {

    const stations = req.db.collection("police.stations");

    let result ;

    try {
        result = await stations.find({}).toArray();
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render( "station" , { err: "error connecting to database" } );

        if ( result.length === 0 )
            return res.status(200).render( "station" , { noresult: "No stations in database" });

        return res.status(200).render( "station", { result } );

    }

});

admin.post("/station", async ( req , res ) => {

    const stations = req.db.collection("police.stations");
    const { station_name, station_address, station_id } = req.body;

    let result ;

    try {
        result = await stations.insert({ station_name , station_address, station_id });
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).render( "station" , { err: "error creating police station" } );

        return res.status(200).redirect("/admin/station");
    }
});

admin.get("/logout", ( req, res ) => {
    delete req.session.____AdminLogedIn____;
    res.status(200).redirect("/admin");
});

module.exports = admin;
