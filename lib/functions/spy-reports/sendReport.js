module.exports = {
    name: 'spySendReport',
    run: async ({station, report_string, user, channel}) => {
        let server = await functions.run('databaseCheckServer', {server_id: channel.guild.id})
        if (server != 0 && server != 1) {
            let stationEmbed = await functions.run('spyCreateStationEmbed', {station: station, user: user, detailed: (server.consent) ? false:true});
            if (server.consent) {
                let id = await functions.run('databaseGetHighestMessagesId');
                if (id != 0 && id != 1)
                    stationEmbed.setFooter(`Spy Report Message ID - ${id.id+1}`);
            }
            console.log(`[+ | REPORT]\t${channel.guild.name} | ${user.tag}^${user.id} | ${channel.name}^${channel.id}`);
            let dateTS = new Date();
            functions.run('logEvents', {
                type: 'report', 
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
            channel.send(stationEmbed).then((message) => {
                if (server.consent)
                    functions.run('databaseAddMessage', {message_id: message.id, server_id: channel.guild.id ,user_id: user.id, station: JSON.stringify(station), spy_report: report_string, timestamp: new Date().getTime()});
            })
        }
    }
}