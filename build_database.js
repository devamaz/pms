
use pms;

var user = "pms";
var pwd = "pms";

db.createUser({ user, pwd, roles: [ "readWrite" ] } );

db.auth(user,pwd);

db.createCollection("users");
db.createCollection("crimelist");
db.createCollection("admin");
db.createCollection("police.officers");
db.createCollection("police.stations");
db.createCollection("reportedcrimes");
db.createCollection("criminals");

db.admin.insert( { username: "admin", password: "5f4dcc3b5aa765d61d8327deb882cf99" } );

db.crimelist.insertMany([
    {
        type: "Armed Robbery",
        commited: Number()
    },
    {
        type: "Kidnapping",
        commited: Number()
    },
    {
        type: "Drug Trafficking",
        commited: Number()
    },
    {
        type: "Sex Trafficking",
        commited: Number()
    },
    {
        type: "Illegal Gun Runnings",
        commited: Number()
    },
    {
        type: "Murder",
        commited: Number()
    }
]);

db.users.insert({
    picture: String(),
    firstName: String(),
    lastName: String(),
    addressOne: String(),
    addressTwo: String(),
    phoneNumber: String(),
    gender: String(),
    bvn: String(),
    dob: String(),
    username: String(),
    password: String(),
    file_id: String()
});

db.reortedcrimes.insert({
    crimes : {
	crime_type : String(),
	crime_location : String(),
	content : String()
    },
    media: {
        image: [
            { name: String(), file_id: String() }
        ],
        videos: [
            { name: String(), file_id: String() }
        ]
    },
    state : String(),
    date : String(),
    reportedBy : String(),
    case_number : String(),
    officers_in_charge: Array()
});


db.police.officers.insert({
    firstName: String(),
    lastName: String(),
    serviceNo: String(),
    dateOfBirth: String(),
    commencementDate: String(),
    picture: String(),
    file_id: String(),
    station: String(),
    assignedTo: Array()
});

db.police.stations.insert({
    station: Array()
});

db.criminal.criminalinfo.insert({
    firstName: String(),
    lastName: String(),
    file_id: String(),
    criminal_id: Number(),
    commited_crimes: [{
        crime_commited: String(),
        station_info: [{
            station: String(),
            officer_in_charge: String(),
            date_imprisoned: Date(),
            jail_number: String()
        }],
        convicted_times: Number()
    }]
});

db.news.insert({
    title: String(),
    content: String(),
    date: Date()
});

// create index
db.reportedcrimes.createIndex({ case_number: 1 }, { unique: true } );
db.users.createIndex({ username: 1, bvn: 1 }, { unique: true });
db.crimemedia.createIndex( { _crime_id: 1 } , { unique: true });
db.police.officers.createIndex( { serviceNo: 1 }, { unique: true } );
db.criminal.criminalinfo.createIndex( { criminal_id: 1 }, { unique: true } );
//db.police.createIndex( { firstName: 1, lastName: 1 } );

db.users.remove({ picture: ""});
db.police.officers.remove({firstName: ""});
db.reportedcrimes.remove({ state: "" });
db.crimemedia.remove({ _crime_id: { $exists: true }});
db.criminal.criminalinfo.remove({ criminal_id: "" });
db.news.remove({title: ""});
