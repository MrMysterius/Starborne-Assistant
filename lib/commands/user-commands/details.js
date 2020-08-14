module.exports = {
    name: 'Details',
    version: '1.0',
    command: 'details',
    aliases: ['detail', 'd'],
    run: async ({msg, command, args}) => {
        if (args[0] != undefined && args[0].length>0) {
            if (msg.deletable) msg.delete({timeout: 15000});
            let id = parseInt(args[0], 10);
            let detailsMessage = await functions.run('databaseCheckMessages', {id: id, server_id: msg.guild.id});
            if (detailsMessage != 0 && detailsMessage != 1) {
                let station = JSON.parse(detailsMessage.station);
                let stationEmbed = await functions.run('spyCreateStationEmbed', {station: station, user: msg.author, detailed: true});
                console.log(`[* | REPORT]\t${msg.guild.name} | ${msg.author.tag}^${msg.author.id} | ${msg.channel.name}^${msg.channel.id}`);
                msg.channel.send(stationEmbed).then((sendMessage) => {
                    if (sendMessage.deletable) sendMessage.delete({timeout: 300000});
                });
            }
        }
    }
}