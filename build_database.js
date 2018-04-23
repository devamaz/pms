
use pms;

var user = "pms";
var pwd = "pms";

db.createUser({ user, pwd, roles: [ "readWrite" ]});

db.auth(user,pwd);

db.createCollection("users");
db.createCollection("crimelist");
db.createCollection("admin");
db.createCollection("police.officers");
db.createCollection("police.stations");
db.createCollection("reportedcrimes");

db.admin.insert( { username: "admin", password: "5f4dcc3b5aa765d61d8327deb882cf99" } );

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

db.reortedcrimes.insert( {
    crimes : {
	crime_type : "",
	crime_location : "",
	content : ""
    },
    media: {
        image: [
            { name: "", file_id: "" }
        ],
        videos: [
            { name: "", file_id: "" }
        ]
    },
    state : "",
    date : "",
    reportedBy : "",
    case_number : "",
    officers_in_charge: []
});


db.police.officers.insert( {
    firstName: "",
    lastName: "",
    servicesNo: "",
    dateOfBirth: "",
    commencementDate: "",
    picture: "",
    file_id: "",
    station: "",
    assignedTo: []
});

db.police.stations.insert({
    station: [ "kiwi", "kaka", "titi", "pipon" ]
});

// create index
db.reportedcrimes.createIndex({ case_number: 1 }, { unique: true } );
db.users.createIndex({ username: 1, bvn: 1 }, { unique: true });
db.crimemedia.createIndex( { _crime_id: 1 } , { unique: true });
db.police.officers.createIndex( { serviceNo: 1 }, { unique: true } );
//db.police.createIndex( { firstName: 1, lastName: 1 } );

db.users.remove({ picture: ""});
db.police.officers.remove({firstName: ""});
db.reportedcrimes.remove( { state: ""} );
db.crimemedia.remove({ _crime_id: { $exists: true }});
