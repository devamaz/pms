

module.exports.deleteHandler = async (req,res) => {

    const { serviceNo } = req.query;
    const police = req.db.collection("police.officers");

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
