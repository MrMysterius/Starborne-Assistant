//IMPORTING MOST MODULES
const config = require('./config.json');
const DiscordBot = require('./bot.js');
const WebSocketServer = require('./webserver.js');

//SOME GLOBALS
global.reports = [];
global.data = {
    shipData: require('./information/ships.json'),
    cardData: require('./information/cards.json')
};
global.lib = require('./lib');


//WEBSOCKETSERVER
const wss = new WebSocketServer(22277);

//DISCORD BOT
const bot = new DiscordBot(config.discordToken, config);