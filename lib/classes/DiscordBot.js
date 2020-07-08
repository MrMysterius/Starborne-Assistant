const Discord = require('discord.js');

module.exports = class DiscordBot {
    constructor ({token, prefix}) {
        if (token == undefined || prefix == undefined) throw new Error("Config file isn't setup correctly");
        this.prefix = prefix;
        this.client = new Discord.Client();

        this.client.on('guildCreate', (guild) => {
            functions.run('discordOnGuildCreate', guild);
        })
        this.client.on('guildDelete', (guild) => {
            functions.run('discordOnGuildDelete', guild);
        })

        this.client.on('ready', () => {
            functions.run('discordOnReady', '');
            functions.run('discordTick');
        })

        this.client.on('message', (message) => {
            functions.run('discordOnMessage', {msg: message});
        })

        this.tick = -1;

        this.client.login(token);
    }
    get guildCount() {
        return this.client.guilds.cache.array().length;
    }
}