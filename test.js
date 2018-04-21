
const cluster = require("cluster");
const os = require("os");

function doFirst() {
    return 1;
}

function doSecond() {
    return 2;
}

function doThird() {
    return 3;
}

function doFourth() {
    return 4;
}

const funcs = [ doFirst, doSecond, doThird, doFourth ];


if ( cluster.isMaster ) {
    
    for ( let i = 0 ; i < funcs.length ; i++ ) {
        const worker = cluster.fork();
        worker.process.send({
            args: [ "arg1", "arg2", "arg3" ],
            haq: i,
            forPid: worker.process.pid
        });
    }
    
} else {

    process.on("message", q => {
        funcs[q.haq]();
    });
}
