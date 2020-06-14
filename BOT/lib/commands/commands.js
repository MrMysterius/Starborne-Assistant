function run(command, args, msg, Bot) {
    switch (command.toLowerCase()) {
        case 'travel':
            require('./travel.js')(Bot, args, msg);
            break;
        default:
            break;
    }
}

module.exports = run;