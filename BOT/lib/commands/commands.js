function run(command, args, msg) {
    switch (command.toLowerCase()) {
        case 'travel':
            require('./travel.js').run(command, args, msg);
            break;
        default:
            break;
    }
}

module.exports = run;