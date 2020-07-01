function run(command, args, msg, client) {
    switch (command.toLowerCase()) {
        case 'travel':
            require('./travel.js')(client, args, msg);
            break;
        case 'help':
            require('./help.js')(client, msg);
            break;
        default:
            break;
    }
}

module.exports = run;