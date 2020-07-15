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
            if (message.author.bot) return;
            functions.run('discordOnMessage', {msg: message});
        })

        this.client.on('channelDelete', (channel) => {
            functions.run('databaseCheckAutoChannels', {channel_id: channel.id}).then((row) => {
                if (row != 0 && row != 1) {
                    functions.run('databaseDeleteAutoChannel', {channel_id: channel.id});
                }
            });
            functions.run('databaseCheckChannels', {channel_id: channel.id}).then((row) => {
                if (row != 0 && row != 1) {
                    functions.run('databaseDeleteOneChannel', {channel_id: channel.id});
                }
            });
        })

        this.tick = -1;

        this.client.login(token);
    }
    get guildCount() {
        return this.client.guilds.cache.array().length;
    }
}