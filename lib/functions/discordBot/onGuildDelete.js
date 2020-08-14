module.exports = {
    name: 'discordOnGuildDelete',
    run: function (guild) {
        console.log(`[- | GUILD]\t${guild.name} - ${guild.owner.user.tag}`);

        let dateTS = new Date();
        functions.run('logEvents', {
            type: 'guild_removed', 
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

        functions.run('databaseCheckServer', {server_id: guild.id}).then((row) => {
            if (!(row == 0 && row != 1)) {
                functions.run('databaseDeleteServer', {server_id: guild.id});
                functions.run('deleteChannels', {server_id: guild.id});
            }
        })
    }
}