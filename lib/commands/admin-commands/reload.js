const path = require('path');

module.exports = {
    name: 'Reload',
    version: '1.0',
    command: 'reload',
    aliases: ['r'],
    run: async ({args, command, msg}) => {
        if (msg.author.id != 137547836609789952) return;
        let dirClass = path.join(process.cwd(), 'lib/classes/');
        let dirConfig = path.join(process.cwd(), 'config');
        const CommandsHandler = require(path.join(dirClass,'CommandHandler.js'));
        commands = '';
        commands = new CommandsHandler(require(path.join(dirConfig,'commands-directorys.json')));
        const FunctionHandler = require(path.join(dirClass,'FunctionHandler.js'));
        functions = '';
        functions = new FunctionHandler(require(path.join(dirConfig,'functions-directorys.json')));
    }
}