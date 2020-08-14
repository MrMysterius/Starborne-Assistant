const Discord = require('discord.js');

module.exports = {
    name: 'Consent',
    version: '1.0',
    command: 'giveConsent',
    aliases: ['revokeConsent'],
    run: async ({msg, command, args}) => {
        if (msg.member.permissions.has('ADMINISTRATOR')) {
            if (msg.deletable) {
                msg.delete({timeout: 15000});
            }
            functions.run('databaseCheckServer', {server_id: msg.guild.id}).then((row) => {
                if (row != 0 && row != 1) {
                    switch (command) {
                        case 'giveConsent':
                            if (row.consent === 1) return;
                            functions.run('databaseUpdateServer', {server_id: row.server_id, custom_prefix: row.custom_prefix, consent: 1});
                            let embedGive = new Discord.MessageEmbed()
                                .setAuthor(msg.author.tag, msg.author.avatarURL({dynamic: true}))
                                .setThumbnail(client.user.avatarURL({dynamic: true}))
                                .setTitle('Thanks for giving consent to store Spy Reports :grinning:')
                                .setColor(0xf5684c);
                            msg.channel.send(embedGive).then((sendMessage) => {
                                if (sendMessage.deletable) {
                                    sendMessage.delete({timeout: 120000});
                                }
                            });
                            break;
                        case 'revokeConsent':
                            if (row.consent === 0) return;
                            functions.run('databaseUpdateServer', {server_id: row.server_id, custom_prefix: row.custom_prefix, consent: 0});
                            let embedRevoke = new Discord.MessageEmbed()
                                .setAuthor(msg.author.tag, msg.author.avatarURL({dynamic: true}))
                                .setThumbnail(client.user.avatarURL({dynamic: true}))
                                .setTitle('Revoked consent to store Spy Reports :confused:')
                                .setColor(0xf5684c);
                            msg.channel.send(embedRevoke).then((sendMessage) => {
                                if (sendMessage.deletable) {
                                    sendMessage.delete({timeout: 120000});
                                }
                            });
                            break;
                    }
                }
            })
        }
    }
}