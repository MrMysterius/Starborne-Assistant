const Discord = require('discord.js');

/**
 * @param {Object} client
 * @param {Object} message
 * @returns {null}
 */
function help(client, message) {
    let embed = new Discord.MessageEmbed();
    embed.setThumbnail(client.user.avatarURL());
    embed.setTitle('Starborne Spy Report Bot');
    embed.setColor(0xf5e58e);

    embed.addField('Links', '**Website:** https://nohobbysfound.net/random/spyreports\n**Forum Post:** https://forums.starborne.com/t/spy-report-coverter-discord-bot/2093\n**"Support" Server:** https://nohobbysfound.net');
    embed.addField('How To Use', 'Using this Bot is really simple just make a channel on your server that includes either `spy-data` or `spy-report` in its name. If somebody then sends a spy report they copied from ingame into this channel the report will be automatically converted. It doesn\'t matter if it a normal message or auto generated message.txt file form discord the bot will convert it.');
    embed.addField('Bot Stats', `Server Count: ${bot.guild_count}`);
    embed.addField('Travel Command', 'Command:\n`'+bot.config.prefix+'travel`\n\nArguments:\n`-startHex [hex]`*\n`-endHex [hex]`*\n`-distance [travel distance]`*\n`-speed [hexperhour]`*\n`-time [current server time]`\n`-eta [eta time to destination]`\n\n* Args are required, only exception either start- and endhex or distance.');

    if (message.deletable) {
        message.delete();
    }
    message.author.createDM();
    try {
        message.author.send(embed);
    }
    catch (err) {
        message.channel.send(embed);
    }
}

module.exports = help;