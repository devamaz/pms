
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



db.users.createIndex({ username: 1, bvn: 1 }, { unique: true });
db.police.officers.createIndex( { serviceNumber: 1 } , { unique: true } );

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
