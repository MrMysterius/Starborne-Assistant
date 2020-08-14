module.exports = {
    name: 'discordOnReady',
    run: (e) => {
        console.log(`\n\n[INFO] Bot connected to ${bot.guildCount} Servers/Guilds`);
        client.guilds.cache.forEach((guild) => {
            functions.run('databaseCheckServer', {server_id: guild.id}).then((row) => {
                if (row == 0 && row != 1) {
                    functions.run('databaseAddServer', {server_id: guild.id, owner_id: guild.owner.id});
                }
            })
        })
    }
}