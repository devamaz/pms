
const getHandlers = Object.defineProperties( {}, {
    
    stations: {
        
        async value(req,res) {
            
            const stations = req.db.collection("police.stations");

            let result;

            try {
                result = await stations.find({}).toArray();
            } catch(ex) {
                result = ex;
            } finally {
                
                if ( Error[Symbol.hasInstance](result) )
                    return res.status(200).json({ err: "cannot connect to database" });
                
                return res.status(200).json({ result });
            }
        }
    },

    crimes: {
        
        async value(req,res) {

            const crimes = req.db.collection("crimelist");

            let result ;

            try {
                result = await crimes.find({}).toArray();
            } catch(ex) {
                result = ex;
            } finally {
                
                if ( Error[Symbol.hasInstance](result) )
                    return res.status(200).json({ err: "cannot connect to database" });

                return res.status(200).json( { result } );
            }
            
        }
    },

    serviceNumber: {
        async value(req,res) {

            const policeinfo = req.db.collection("police.officers");
            const { serviceNo } = req.query;
            
            let result ;

            try {
                result = await policeinfo.findOne( { serviceNo } );
            } catch(ex) {
                result = ex;
            } finally {
                                
                if ( Error[Symbol.hasInstance](result) )
                    return res.status(200).json({ err: "cannot connect to database" });

                return res.status(200).json( { result } );
            }
            
        }
    }
});


module.exports.criminalGetHandler = (req,res) => {
    getHandlers[req.query.type](req,res);
};
