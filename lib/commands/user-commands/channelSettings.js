const Discord = require('discord.js');

module.exports = {
    name: 'Channel Settings',
    version: '1.0',
    command: 'enableAutoChannels',
    aliases: ['disableAutoChannels','setServer','setStarborneServer','setTimeout','setCategory'],
    run: async ({msg, command, args}) => {
        const ONE_WEEK_IN_MINUTES = 10080;
        const TWO_DAYS_IN_MINUTES = 2880;
        const ONE_HOUR_IN_MINUTES = 60;

        var row = await functions.run('databaseCheckChannels', {channel_id: msg.channel.id});
        if (row == 0 || row == 1 || row == undefined) {
            row = {channel_id: msg.channel.id, server_id: msg.guild.id, starborne_server: null, isAutoChannelEnabled: 0, autoChannelCategoryId: null, autoChannelTimeout: TWO_DAYS_IN_MINUTES};
            functions.run('databaseAddChannel', row);
        }
        switch (command) {
            case 'enableAutoChannels':
                if (row.isAutoChannelEnabled == 1) return;
                row.isAutoChannelEnabled = 1;
                functions.run('databaseUpdateChannel', row);
                let enableEmbed = new Discord.MessageEmbed()
                    .setColor(0x9568f7)
                    .setTitle(`Enabled Auto Channels on ${msg.channel.name}`);
                msg.channel.send(enableEmbed).then((answer) => {
                    if (answer.deletable) answer.delete({timeout: 60000});
                })
                if (msg.deletable) msg.delete({timeout: 15000});
                break;
            case 'disableAutoChannels':
                if (row.isAutoChannelEnabled == 0) return;
                row.isAutoChannelEnabled = 0;
                functions.run('databaseUpdateChannel', row);
                let disableEmbed = new Discord.MessageEmbed()
                    .setColor(0x9568f7)
                    .setTitle(`Disabled Auto Channels on ${msg.channel.name}`);
                msg.channel.send(disableEmbed).then((answer) => {
                    if (answer.deletable) answer.delete({timeout: 60000});
                })
                if (msg.deletable) msg.delete({timeout: 15000});
                break;
            case 'setServer'||'setStarborneServer':
                if (args[0] == undefined) return;
                args[0] = parseInt(args[0], 10);
                if (args[0]>0 && args[0]<10000) {
                    row.starborne_server = args[0];
                    functions.run('databaseUpdateChannel', row);
                    let serverEmbed = new Discord.MessageEmbed()
                        .setColor(0x9568f7)
                        .setTitle(`Set Starborne Server on ${msg.channel.name} to ${row.starborne_server}`);
                    msg.channel.send(serverEmbed).then((answer) => {
                        if (answer.deletable) answer.delete({timeout: 60000});
                    })
                    if (msg.deletable) msg.delete({timeout: 15000});
                }
                break;
            case 'setTimeout':
                if (args[0] == undefined) return;
                args[0] = parseInt(args[0], 10);
                if (args[0]>=ONE_HOUR_IN_MINUTES && args[0]<=ONE_WEEK_IN_MINUTES) {
                    row.timeout = args[0];
                    functions.run('databaseUpdateChannel', row);
                    let timeoutEmbed = new Discord.MessageEmbed()
                        .setColor(0x9568f7)
                        .setTitle(`Set Auto Channel timeout on ${msg.channel.name} to ${row.timeout}`);
                    msg.channel.send(timeoutEmbed).then((answer) => {
                        if (answer.deletable) answer.delete({timeout: 60000});
                    })
                    if (msg.deletable) msg.delete({timeout: 15000});
                }
                break;
            case 'setCategory':
                if (args[0] == undefined) return;
                if (args[0].length>0 && args[0].length<50) {
                    row.autoChannelCategoryId = args[0];
                    functions.run('databaseUpdateChannel', row);
                    let categoryEmbed = new Discord.MessageEmbed()
                        .setColor(0x9568f7)
                        .setTitle(`Set Auto Channel Category on ${msg.channel.name} to ${row.autoChannelCategoryId}`);
                    msg.channel.send(categoryEmbed).then((answer) => {
                        if (answer.deletable) answer.delete({timeout: 60000});
                    })
                    if (msg.deletable) msg.delete({timeout: 15000});
                }
        }
    }
}