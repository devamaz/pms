
use pms;

var user = "pms";
var pwd = "pms";

db.createUser({ user, pwd, roles: [ "readWrite" ]});

db.auth(user,pwd);

db.createCollection("users");
db.createCollection("crimelist");
db.createCollection("admin");
db.createCollection("police.officer");
db.createCollection("reportedcrimes");

db.crimelist.insertMany([
    {
        type: "Armed Robbery",
        commited: 0
    },
    {
        type: "Kidnapping",
        commited: 0
    },
    {
        type: "Drug Trafficking",
        commited: 0
    },
    {
        type: "Sex Trafficking",
        commited: 0
    },
    {
        type: "Illegal Gun Runnings",
        commited: 0
    },
    {
        type: "Murder",
        commited: 0
    }
]);

db.users.insert({
    picture: "",
    firstName: "",
    lastName: "",
    addressOne: "",
    addressTwo: "",
    phoneNumber: "",
    gender: "",
    bvn: "",
    dob: "",
    username: "",
    password: "",
    file_id: ""
});

db.reortedCrimes.insert( {
    
    media: {
        image: [
            { name: "", file_id: "" }
        ],
        videos: [
            { name: "", file_id: "" }
        ]
    }
});

// db.crimemedia.insert({
//     _crime_id: "id of commited crime that this media document is related to",
//     media: {
//         image: [
//             { name: "", file_id: "" }
//         ],
//         videos: [
//             { name: "", file_id: "" }
//         ]
//     }
// });


// create index

db.fs.files.ensureIndex( { useruploaded: 1 }, { unique: true });
db.users.createIndex({ username: 1, bvn: 1 }, { unique: true });
db.crimemedia.createIndex( { _crime_id: 1 } , { unique: true });
db.police.officers.createIndex( { serviceNumber: 1 } , { unique: true } );

db.users.remove({ picture: ""});
db.crimemedia.remove({ _crime_id: { $exists: true }});
