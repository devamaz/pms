

module.exports.deleteHandler = async (req,res) => {

    const { serviceNo } = req.query;
    const police = req.db.collection("police.officers");
    const reportedCrimes = req.db.collection("reportedCrimes");

    let result;

    try {
        result = await police.removeOne( { serviceNo } );
        await reportedCrimes.update({ officers_in_charge: { $in: [ serviceNo ] } }, { $pull: { officers_in_charge: serviceNo } } , { multi: true });
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json( { done: false } );

        if ( result.deletedCount === 1 )
            return res.status(200).json( { done: true } );

    }
};

module.exports.transferPostHandler = async (req,res) => {

    const { serviceNo } = req.query;
    const { station } = req.body;

    const police = req.db.collection("police.officers");
    const stations = req.db.collection("police.stations");

    let result;

    try {
        result = await police.updateOne( { serviceNo } , { $set: { station } } );
    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json({ done: false });

        return res.status(200).json({ done: true });
    }
};

module.exports.assignPostHandler = async (req,res) => {
    
    const { serviceNo } = req.query;
    const { casen } = req.body;

    const police = req.db.collection("police.officers");
    const reportedCrimes = req.db.collection("reportedcrimes");

    let result;

    try {

        result = await reportedCrimes.findOne( { case_number: casen } );
        result = await police.findOneAndUpdate( { serviceNo , "assignedTo.case_number": { $ne: result.case_number } },
                                                { $push: { assignedTo: { case_id:result._id, case_number: result.case_number }}}
                                              );

        if ( result.value )
            await reportedCrimes.findOneAndUpdate({ case_number: casen }, { $push: { officers_in_charge: serviceNo } } );

    } catch(ex) {
        result = ex;
    } finally {

        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json({ done: false });

        if ( ! result.value )
            return res.status(200).json({ done: false });

        return res.status(200).json({ done: true });
    }
};

module.exports.transferGetHandler = async ( req, res ) => {
    
    const stations = req.db.collection("police.stations");
    let result;
    
    try {
        result = await stations.find({});
    } catch(ex) {
        result = ex;
    } finally {
        if ( Error[Symbol.hasInstance](result) )
            return res.status(200).json("police", { done: false });

        result = await result.toArray();

        return res.status(200).json({ done: true , stations: result });
    }
};
