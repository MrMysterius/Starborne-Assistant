const Discord = require('discord.js');

module.exports = {
    name: 'SetPrefix',
    version: '1.0',
    command: 'setPrefix',
    aliases: ['prefix'],
    run: async ({msg, command, args}) => {
        if (msg.deletable) {
            msg.delete({timeout: 15000});
        }
        let displayPrefix = (msg, prefix) => {
            let embed = new Discord.MessageEmbed()
                .setColor(0x55fa9f)
                .setTitle(`The servers prefix is ${prefix}`);
            msg.channel.send(embed).then((sendMessage) => {
                if (sendMessage.deletable) {
                    sendMessage.delete({timeout: 120000});
                }
            })
        }
        let updatePrefix = (msg, prefix) => {
            let embed = new Discord.MessageEmbed()
                .setColor(0x55fa9f)
                .setTitle(`The servers prefix has been updated to ${prefix}`);
            msg.channel.send(embed).then((sendMessage) => {
                if (sendMessage.deletable) {
                    sendMessage.delete({timeout: 120000});
                }
            })
        }
        if (msg.member.permissions.has('ADMINISTRATOR')) {
            switch (command) {
                case 'setPrefix':
                    if (args.length == 0) {
                        functions.run('databaseCheckServer', {server_id: msg.guild.id}).then((row) => {
                            if (row != 0 && row != 1) {
                                functions.run('databaseUpdateServer', {server_id: msg.guild.id, custom_prefix: null, consent: row.consent});
                                updatePrefix(msg, bot.prefix);
                            }
                        })
                    } else {
                        if (args[0].length < 5) {
                            functions.run('databaseCheckServer', {server_id: msg.guild.id}).then((row) => {
                                if (row != 0 && row != 1) {
                                    functions.run('databaseUpdateServer', {server_id: msg.guild.id, custom_prefix: args[0], consent: row.consent});
                                    updatePrefix(msg, args[0]);
                                }
                            })
                        }
                    }
                    break;
                case 'prefix':
                    if (args.length == 0) {
                        functions.run('databaseCheckServer', {server_id: msg.guild.id}).then((row) => {
                            if (row != 0 && row != 1) {
                                displayPrefix(msg, (row.custom_prefix == null)?bot.prefix:row.custom_prefix);
                            }
                        })
                    } else {
                        if (args[0].length < 5) {
                            functions.run('databaseCheckServer', {server_id: msg.guild.id}).then((row) => {
                                if (row != 0 && row != 1) {
                                    functions.run('databaseUpdateServer', {server_id: msg.guild.id, custom_prefix: args[0], consent: row.consent});
                                    updatePrefix(msg, args[0]);
                                }
                            })
                        }
                    }
                    break;
            }
        } else {
            functions.run('databaseCheckServer', {server_id: msg.guild.id}).then((row) => {
                displayPrefix(msg, (row.custom_prefix == null)?bot.prefix:row.custom_prefix);
            })
        }
    }
}