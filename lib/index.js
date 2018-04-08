const { GridFSBucket, ObjectID } = require("mongodb");

module.exports = req => {

    const grids = {};
    const grid_db = new GridFSBucket(req.db);

    Object.defineProperties( grids, {

        writeFile: {

            async value(cb) {

                const gridOpen = await grid_db.openUploadStream(req.body.picture);
                const gridWrite = await gridOpen.write(req.__private_PICTURE_DATA);

                gridOpen.end((err,data) => {
                    if ( err ) {
                        cb(err);
                        return ;
                    }
                    cb(null, data);
                });

            },
            enumerable: false

        },

        readFile: {

            async value(file_id,cb) {

                const gridDownload = await grid_db.openDownloadStream(file_id);
                const gridStart = await gridDownload.start();

                let __streamDATA_URI_DATA = "";

                gridStart.on("data", data => {
                    __streamDATA_URI_DATA += data.toString("base64");
                } );

                gridStart.on("end", () => cb(null,__streamDATA_URI_DATA));

            },
            enumerable: false
        },

        readUserProfilePic: {

            async value(db,cb) {

                const users = req.db.collection(db);

                users.findOne({ username: req.session.userCred.username }, async ( err , result ) => {

                    if ( err )
                        return cb(err);


                    this.readFile( result.file_id, ( err , data_uri ) => {
                        if ( err )
                            return cb(err);
                            //res.status(400).render("update_profile", { err: "Unexpected Error while communicating with the database" });

                        delete result.password;
                        delete result.username;
                        delete result.picture;
                        delete result._id;
                        delete result.file_id;

                        req.session.userCred.data_uri = result.data_uri = `background: url("data:image/jpeg;base64,${data_uri}") center no-repeat; background-size: cover;`;

                        return cb(null, result);

                    });
                });
            }
        },

        writeMediaFile: {

            async value({ type, media, _id }) {

                const reportedCrimes = req.db.collection("reportedcrimes");
                
                req.body.picture = media.name;
                req.__private_PICTURE_DATA = media.data;

                this.writeFile( async ( err, data ) => {

                    if ( err ) {
                        Promise.reject({ err });
                        return;
                    }

                    const reportedCrimes = req.db.collection("reportedcrimes");

                    try {
                        await reportedCrimes.update( { _id }, {
                            $push: {
                                ["media." + type]: { name: media.name, file_id: data._id }
                            }
                        });
                    } catch(ex) {
                        Promise.reject(ex);
                        return ;
                    }
                    

                });
            }
        },
        itereateValues: {
            async value(content,cb) {
                let len = (await content).length - 1;
                let i = 0;
                for ( let data of (await content) ) {
                    this.readFile( data.file_id, ( err, data_uri) => {
                        if ( err ) {
                            data.picture_data = err;
                        } else {
                            data.picture_data = data_uri;
                        }
                        
                        if ( (i++ + 1) > len ) {
                            cb(content);
                            return ;
                        }
                        return;
                    });
                }
            }
        }
    });

    return grids;
};
