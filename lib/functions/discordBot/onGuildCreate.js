const Discord = require('discord.js');

module.exports = {
    name: 'discordOnGuildCreate',
    run: function (guild) {
        console.log(`[+ | GUILD]\t${guild.name} - ${guild.owner.user.tag}`);

        let dateTS = new Date();
        functions.run('logEvents', {
            type: 'guild_added', 
            timestamp: {
                year: dateTS.getFullYear(),
                month: dateTS.getMonth()+1,
                day: dateTS.getDate(),
                hour: dateTS.getHours(),
                minute: dateTS.getMinutes(),
                second: dateTS.getSeconds(),
                full_timestamp: dateTS.getTime()
            }
        })
        
        let welcomeEmbed = new Discord.MessageEmbed()
            .setThumbnail(client.user.avatarURL({dynamic: true}))
            .setColor(0xf73b93)
            .setTitle('Thanks for inviting the Spy Report Bot')
            .addField('Quick Start', 'For a quick start to use this bot just make a channel with either `spy-data` or `spy-report` in the name and make sure the bot has access to it.')
            .addField('Full Potential', `If you want to use the bot to its full potential, I would appreciate giving consent by an administrator of the server with \`${bot.prefix}giveConsent\`, that I can store spy reports for other commands. You can at anytime revoke the consent with \`${bot.prefix}revokeConsent\`. Just a disclaimer spy reports already stored will NOT be deleted.`)
            .addField('Auto Channels', 'You can setup auto channel so your spy reports are a bit more organized for this i would recommend a visit on the website https://nohobbysfound.net/random/spyreports');
 
        functions.run('databaseCheckServer', {server_id: guild.id}).then((row) => {
            if (row == 0 && row != 1) {
                functions.run('databaseAddServer', {server_id: guild.id, owner_id: guild.owner.id});
            }
        });

        var isSend = false;
        for (var i=0; i<guild.channels.cache.array().length; i++) {
            let channel = guild.channels.cache.array()[i];
            if (channel.type!='text') continue;
            if (channel.permissionsFor(bot.client.user).has(['SEND_MESSAGES','ATTACH_FILES']) || channel.permissionsFor(guild.me).has('ADMINISTRATOR')) {
                channel.send(welcomeEmbed);
                isSend = true;
                break;
            }
        }
        if (!isSend) {
            guild.owner.createDM();
            guild.owner.send(welcomeEmbed);
        }
    }
}