module.exports = {
    name: 'discordTick',
    run: async () => {
        if (bot.tick != -1) clearInterval(bot.tick);

        let interval = () => {
            bot.client.user.setPresence({activity: {name: `${bot.prefix}help | ${bot.guildCount} Guilds`}});
            functions.run('discordCheckTimeouts');
            let dateTS = new Date();
            if (dateTS.getHours() == 0 && dateTS.getMinutes() == 0) {
                functions.run('logEvents', {
                    type: 'guild_total',
                    count: bot.guildCount,
                    timestamp: {
                        year: dateTS.getFullYear(),
                        month: dateTS.getMonth()+1,
                        day: dateTS.getDate(),
                        hour: dateTS.getHours(),
                        minute: dateTS.getMinutes(),
                        second: dateTS.getSeconds(),
                        full_timestamp: dateTS.getTime()
                    }
                });
            }
        }

        interval();
        bot.tick = setInterval(interval,60000);
    }
}