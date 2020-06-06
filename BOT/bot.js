const Discord = require('discord.js');

class DiscordBot {
    constructor (token) {
        this.client = new Discord.Client();

        //ADDED TO GUILD
        this.client.on('guildCreate', (guild) => {
            var tabs = '';
            for (var i=0; i<Math.floor(guild.name.length+12/8); i++) {
                tabs += '\t'
            }
            console.log(`[+ | GUILD] ${guild.name}${tabs}${guild.owner.user.tag}`);
        })

        //REMOVED FROM GUILD
        this.client.on('guildDelete', (guild) => {
            var tabs = '';
            for (var i=0; i<Math.floor(guild.name.length+12/8); i++) {
                tabs += '\t'
            }
            console.log(`[- | GUILD] ${guild.name}${tabs}${guild.owner.user.tag}`);
        })

        this.client.login(token);
    }
}

module.exports = DiscordBot;