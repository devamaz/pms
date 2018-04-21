const cluster = require("cluster");
const os = require("os");
const category = [ "rock", "paper", "scissors", "tits" ];
let funcs = [ "val1", "val2", "val3", "val4", "val5" ];

const populateRock = [];
const populatePaper = [];
const populateScissors = [];

const mamaHatesYou = [];


function sayM(value) {
    process.send({ done: true, value });
}

if ( cluster.isMaster ) {
    
    for ( let i = 0 ; i < os.cpus().length ; i++ ) {
        
        const worker = cluster.fork();

        worker.process.send({
            message:funcs.shift(),
            category: category[Math.floor(Math.random(category.length) * category.length)]
        });
        
        worker.on("message", message => {
            if ( message.done && funcs.length === 0 ) {
                console.log("done");
                console.log("paper ", populatePaper, "rock " , populateRock, "scissors " , populateScissors, "hates ", mamaHatesYou);
                worker.process.kill();
                return ;
            }
            const { value: { message: mMessage, category: mCategory } } = message;
            
            switch(mCategory){
            case "rock": populateRock.push(mMessage); break;
            case "paper": populatePaper.push(mMessage); break;
            case "scissors": populateScissors.push(mMessage); break;
            default:
                mamaHatesYou.push(mMessage);
            }
            
            worker.process.send({
                message:funcs.shift(),
                category: category[Math.floor(Math.random(category.length) * category.length)]
            });
            
        });
    }
    
} else {
    process.on("message" , sayM);
}



// if ( cluster.isMaster ) {

//     for ( let i = 0; i < os.cpus().length ; i++ ) {
//         const worker = cluster.fork();
//         worker.process.send({message: readMedia.shift()});
//         worker.on("message", message => {
//             if ( message.done && readMedia.length === 0 ) {
//                 worker.process.kill();
//                 return ;
//             }

//             worker.process.send({ message: readMedia.shift()});
//         });
//     }

// } else {

//     process.on("message", message => {
//         console.log(message);
//     });
// }
