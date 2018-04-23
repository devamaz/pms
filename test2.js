const cluster = require("cluster");
const os = require("os");
const category = [ "rock", "paper", "scissors" ];
let values = [ "val1", "val2", "val3", "val4", "val5" ];

const populateRock = [];
const populatePaper = [];
const populateScissors = [];

const mamaHatesYou = [];


function sayM(value) {
    process.send({ done: true, value });
}

if ( cluster.isMaster ) {

    // 2 cores
    for ( let i = 0 ; i < os.cpus().length ; i++ ) {
        
        // create a child process
        const worker = cluster.fork();

        
        // send a message to the child process, with a single data
        worker.process.send({
            message:values.shift(),
            category: category[Math.floor(Math.random(category.length) * category.length)]
        });

        // receives result back from the process
        worker.on("message", message => {

            // if the array is empty kill that particular process
            if ( message.done && values.length === 0 ) {
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

            // send another data to any process that reaches here first
            
            worker.process.send({
                message:values.shift(),
                category: category[Math.floor(Math.random(category.length) * category.length)]
            });
            
        });
    }
    
} else {
    process.on("message" , sayM);
}
