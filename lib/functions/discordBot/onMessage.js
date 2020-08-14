module.exports = {
    name: 'discordOnMessage',
    run: async ({msg}) => {
        if (msg.channel.type != 'text') return;
        functions.run('databaseCheckServer', {server_id: msg.guild.id}).then((row) => {
            if (!(row == 0 || row == 1)) {
                //COMMAND
                var prefix = (row.custom_prefix == null) ? bot.prefix:row.custom_prefix;
                if (msg.content.startsWith(prefix)) {
                    let args = msg.content.slice(prefix.length).split(' ');
                    let command = args.splice(0,1)[0];
                    let dateTS = new Date();
                    let success = commands.run(command, {command: command, args: args, msg: msg})
                    if (success) functions.run('logEvents', {
                        type: 'command',
                        command: command, 
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
                    return;
                }

                //SPY REPORT
                let reportStringHandler = (report_string, message) => {
                    switch (message.channel.type) {
                        case 'text':
                            //CREATE STATION EMBED
                            functions.run('spyCreateStation', {report_string: report_string}).then((station) => {
                                //CHECK OUTCOME
                                if (station != 0 && station != 0 && station != undefined) {
                                    //GET CHANNEL SETTINGS
                                    functions.run('databaseCheckChannels', {channel_id: message.channel.id}).then((channelSettings) => {
                                        //CHECK IF IT GOT CHANNEL SETTINGS
                                        if (channelSettings != 0 && channelSettings != 1 && channelSettings.isAutoChannelEnabled == 1) {
                                            //CHECKING IF AUTO CHANNEL CATEGORY EXISTS
                                            let category = bot.client.guilds.cache.get(message.guild.id).channels.cache.get(channelSettings.autoChannelCategoryId);
                                            if (category != undefined && category.type == 'category') {
                                                functions.run('discordCreateAutoChannel', {category: category, station: station, server: channelSettings.starborne_server, timeout: channelSettings.autoChannelTimeout}).then((autoChannel) => {
                                                    if (autoChannel != 0 && autoChannel != 1 && autoChannel != undefined)
                                                        functions.run('spySendReport', {report_string: report_string, channel: autoChannel, station: station, user: message.author});
                                                })
                                                return;
                                            }
                                            bot.client.guilds.cache.get(message.guild.id).channels.create('Spy Reports', {type: 'category', reason: 'Category creation for Auto Channels'}).then((newCategory) => {
                                                functions.run('databaseUpdateChannel', {starborne_server: channelSettings.starborne_server, isAutoChannelEnabled: channelSettings.isAutoChannelEnabled, autoChannelTimeout: channelSettings.autoChannelTimeout, autoChannelCategoryId: newCategory.id, channel_id: channelSettings.channel_id});
                                                functions.run('discordCreateAutoChannel', {category: newCategory, station: station, server: channelSettings.starborne_server, timeout: channelSettings.autoChannelTimeout}).then((autoChannel) => {
                                                    if (autoChannel != 0 && autoChannel != 1 && autoChannel != undefined)
                                                        functions.run('spySendReport', {report_string: report_string, channel: autoChannel, station: station, user: message.author});
                                                })
                                                return;
                                            })
                                            return;
                                        } else {
                                            if ((channelSettings != 0 && channelSettings != 1 && channelSettings.isAutoChannelEnabled == 0) || message.channel.name.includes('spy-data') || message.channel.name.includes('spy-report'))
                                            functions.run('spySendReport', {report_string: report_string, channel: message.channel, station: station, user: message.author});
                                        }
                                    })
                                    if (message.deletable) message.delete();
                                }
                            });
                            break;
                        case 'dm':
                            break;
                    }
                }

                let attachment = msg.attachments.array()[0];
                if (attachment != undefined && attachment.name == 'message.txt' && attachment.size < 100000) {
                    functions.run('downloadReport', {url: attachment.url}).then((string) => {
                        reportStringHandler(string.toString(), msg);
                    })
                    return;
                }
                if (msg.content.startsWith('Spy Report on hex')) {
                    reportStringHandler(msg.content, msg);
                    return;
                }
            }
        })
    }
}