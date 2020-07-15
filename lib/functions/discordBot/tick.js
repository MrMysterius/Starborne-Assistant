module.exports = {
    name: 'discordTick',
    run: async () => {
        if (bot.tick != -1) clearInterval(bot.tick);

        let interval = () => {
            bot.client.user.setPresence({activity: {name: `${bot.prefix}help | ${bot.guildCount} Guilds`}});
            functions.run('discordCheckTimeouts');
        }

        interval();
        bot.tick = setInterval(interval,60000);
    }
}