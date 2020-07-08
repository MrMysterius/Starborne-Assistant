const CommandsHandler = require('./lib/classes/CommandHandler.js');
global.commands = new CommandsHandler(require('./config/commands-directorys.json'));

const FunctionHandler = require('./lib/classes/FunctionHandler.js');
global.functions = new FunctionHandler(require('./config/functions-directorys.json'));

const Database = require('./lib/classes/Database.js');
global.db = new Database('test').database;

const DiscordBot = require('./lib/classes/DiscordBot.js');
global.bot = new DiscordBot(require('./config/discord-bot.json'));

setInterval(()=>{
    global.client = bot.client;
},1);