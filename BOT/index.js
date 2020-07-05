//IMPORTING MOST MODULES
const config = require('./config.json');
const DiscordBot = require('./bot.js');
const Database = require('./database.js');

//SOME GLOBALS
global.reports = [];
global.data = {
    shipData: require('./information/ships.json'),
    cardData: require('./information/cards.json')
};
global.lib = require('./lib');

//Database
global.db = new Database('/database/spy-reports-database.db');

//DISCORD BOT
global.bot = new DiscordBot(config.discordToken, config);