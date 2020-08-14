module.exports = {
    name: 'discordCheckTimeouts',
    run: async () => {
        bot.client.guilds.cache.forEach((guild) => {
            functions.run('databaseGetAutoChannelsByServer', {server_id: guild.id}).then((rows) => {
                if (rows != 0 && rows != 1) {
                    rows.forEach((row) => {
                        let now = new Date().getTime();
                        if (now - row.lastMessageOn >= (row.timeout*60)*1000) {
                            let channel = guild.channels.cache.get(row.channel_id);
                            if (channel.deletable) {
                                channel.delete();
                            }
                        }
                    })
                }
            })
        })
    }
}