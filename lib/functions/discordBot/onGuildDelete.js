module.exports = {
    name: 'discordOnGuildDelete',
    run: function (guild) {
        console.log(`[- | GUILD]\t${guild.name} - ${guild.owner.user.tag}`);
        functions.run('databaseCheckServer', {server_id: guild.id}).then((row) => {
            if (!(row == 0 && row != 1)) {
                functions.run('databaseDeleteServer', {server_id: guild.id});
                functions.run('deleteChannels', {server_id: guild.id});
            }
        })
    }
}