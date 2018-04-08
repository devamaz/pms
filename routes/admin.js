const express = require("express");
const crypto = require("crypto");
const gridFs = require("../lib/");
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

admin.get("/police", async (req,res) => {
    const police = req.db.collection("police");
    let result;
    try {
        result = (await police.find({ }, { _id: 0 })).toArray();
    } catch(ex) {
        result = ex;
    } finally {
        if ( Error[Symbol.hasInstance](result) ) {
            res.status(200).render("police",{ err: "Cannot Retrieve Police Information" } );
            return;
        }
        if ( (await result).length === 0 ) {
            res.status(200).render("police",{ noresult: "No officer in Database"} );
            return ;
        }

        const gridMeth = gridFs(req);

        gridMeth.itereateValues(result, async (policeinfo) => {
            policeinfo = await policeinfo;
            res.status(200).render("police", { policeinfo });
            return;
        });


    }


});


admin.post("/police", async (req,res) => {

    const police = req.db.collection("police");

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

        police.insertOne( { firstName, lastName, serviceNo, dateOfBirth, commencementDate, picture, station, serviceNo , file_id: data._id, assignedTo }, async ( err, result ) => {

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

    const { serviceNo } = req.query;
    const police = req.db.collection("police");

    let result;

    try {
        result = await police.removeOne( { serviceNo } );
        console.log(result);
    } catch(ex) {
        result = ex;
    } finally {
        
        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json( { done: false } );

        if ( result.deletedCount === 1 )
            return res.status(200).json( { done: true } );
        
    }
});

admin.get("/logout", ( req, res ) => {
    delete req.session.____AdminLogedIn____;
    res.status(200).redirect("/admin");
});

module.exports = admin;
