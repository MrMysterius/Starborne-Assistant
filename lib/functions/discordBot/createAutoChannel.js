module.exports = {
    name: 'discordCreateAutoChannel',
    run: async ({category, station, server, timeout}) => {
        return new Promise((resolve) => {
            async function findChannel() {
                let channelList = [];
                for (var i=0; i<category.children.array().length; i++) {
                    let row = await functions.run('databaseCheckAutoChannels', {channel_id: category.children.array()[i].id})
                    if (row != 0 && row != 1) channelList.push({channel_id: row.channel_id, server_id: row.server_id, lastMessageOn: row.lastMessageOn, hex: row.hex, starborne_server: row.starborne_server, timeout: row.timeout});
                }

                if (station.hex.x != 'N/A' && station.hex.y != 'N/A' && station.hex.x != '' && station.hex.y != '') {
                    let hexString = `${station.hex.x},${station.hex.y}`;
                    var id = -1;
                    for (let i=0; i<channelList.length; i++) {
                        if (hexString == channelList[i].hex && server == channelList[i].starborne_server) {
                            id = i;
                            break;
                        }
                    }
                    if (id != -1) {
                        let channel = bot.client.channels.cache.get(channelList[id].channel_id);
                        functions.run('databaseUpdateAutoChannel', {lastMessageOn: new Date().getTime(), channel_id: channelList[id].channel_id});
                        return channel;
                    } else {
                        let xS = (station.hex.x < 0) ? '－':'＋';
                        let yS = (station.hex.y < 0) ? '－':'＋';
                        let string = (server == null) ? `⌬${xS}${Math.abs(station.hex.x)}${yS}${Math.abs(station.hex.y)}︱${station.name}`:`☰${server}⌬${xS}${Math.abs(station.hex.x)}${yS}${Math.abs(station.hex.y)}︱${station.name}`;
                        let newChannel = await category.guild.channels.create(string, {type: 'text', parent: category.id, reason: 'Auto Channel for a Spy Report'});
                        functions.run('databaseAddAutoChannel', {server_id: newChannel.guild.id, channel_id: newChannel.id, hex: hexString, starborne_server: server, timeout: timeout, lastMessageOn: new Date().getTime()});
                        return newChannel;
                    }
                } else {
                    return 0;
                }
            }
            resolve(findChannel(category));
        })
    }
}