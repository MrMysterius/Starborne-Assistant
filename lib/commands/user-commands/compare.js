const Discord = require('discord.js');

module.exports = {
    name: 'Compare',
    version: '1.0',
    command: 'compare',
    aliases: ['c'],
    run: async ({msg, command, args}) => {
        if (args[0]!=undefined&&args[1]!=undefined&&args[0].length>0&&args[1].length>0) {
            if (msg.deletable) msg.delete({timeout: 15000});
            let idBefore = parseInt(args[0],10);
            let idAfter = parseInt(args[1],10);
            let messageBefore = await functions.run('databaseCheckMessages', {id: idBefore, server_id: msg.guild.id});
            let messageAfter = await functions.run('databaseCheckMessages', {id: idAfter, server_id: msg.guild.id});
            if (messageBefore!=0&&messageBefore!=1&&messageAfter!=0&&messageAfter!=1) {
                let stationBefore = JSON.parse(messageBefore.station);
                let stationAfter = JSON.parse(messageAfter.station);
                if (!(stationBefore.hex.x==stationAfter.hex.x&&stationBefore.hex.y==stationAfter.hex.y)) return;
                let diffrence = {
                    fp_base: stationBefore.fleet_fp_base - stationAfter.fleet_fp_base,
                    hp_base: stationBefore.fleet_hp_base - stationAfter.fleet_hp_base,
                    cargo_base: stationBefore.fleet_cargo_base - stationAfter.fleet_cargo_base,
                    bombing_base: stationBefore.fleet_bombing_base - stationAfter.fleet_bombing_base,
                    fp_min: stationBefore.fleet_fp_min - stationAfter.fleet_fp_min,
                    hp_min: stationBefore.fleet_hp_min - stationAfter.fleet_hp_min,
                    cargo_min: stationBefore.fleet_cargo_min - stationAfter.fleet_cargo_min,
                    bombing_min: stationBefore.fleet_bombing_min - stationAfter.fleet_bombing_min,
                    fp_max: stationBefore.fleet_fp_max  - stationAfter.fleet_fp_max,
                    hp_max: stationBefore.fleet_hp_max - stationAfter.fleet_hp_max,
                    cargo_max: stationBefore.fleet_cargo_max - stationAfter.fleet_cargo_max,
                    bombing_max: stationBefore.fleet_bombing_max - stationAfter.fleet_bombing_max,
                    labor: stationBefore.fleet_labor - stationAfter.fleet_labor
                };
                let compareEmbed = new Discord.MessageEmbed()
                    .setTitle(`Comparisson of ${idAfter} to ${idBefore}`)
                    .setColor(0x69f062)
                    .setAuthor(`${msg.author.username}`, msg.author.avatarURL({dynamic: true}))
                    .setThumbnail(client.user.avatarURL({dynamic: true}))
                    .addField('Raw Fleet Stats', `FP: ${diffrence.fp_base}\nHP: ${diffrence.hp_base}\nCargo: ${diffrence.cargo_base}\nBombing: ${diffrence.bombing_base}`, true)
                    .addField('Min Fleet Stats w/ Cards', `FP: ${diffrence.fp_min}\nHP: ${diffrence.hp_min}\nCargo: ${diffrence.cargo_min}\nBombing: ${diffrence.bombing_min}`, true)
                    .addField('Max Level Bonus Fleet Stats w/ Cards', `FP: ${diffrence.fp_max}\nHP: ${diffrence.hp_max}\nCargo: ${diffrence.cargo_max}\nBombing: ${diffrence.bombing_max}`, true);
                
                

                msg.channel.send(compareEmbed);
            }
        }
    }
}