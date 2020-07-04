const Discord = require('discord.js');

/**
 * Makes an embed out of a Station Object
 * @param {Object} StationObject
 * @param {Object} DiscordMessageObject
 */
function createReportEmbed(station, msg, Bot) {

    try {
        let metal = Bot.emojis.cache.find(emoji => emoji.name === 'sb_metal');
        let gas = Bot.emojis.cache.find(emoji => emoji.name === 'sb_gas');
        let crystal = Bot.emojis.cache.find(emoji => emoji.name === 'sb_crystal');

        var embed = new Discord.MessageEmbed();
        embed.setAuthor(msg.author.username, msg.author.displayAvatarURL());

        embed.setTitle('Spy Report sent from '+msg.author.username);
        embed.setDescription(station.description);

        embed.setColor(0x4a6af7);

        embed.setThumbnail(Bot.user.displayAvatarURL());

        //FIELDS
        //Hex
        embed.addField('Hex', `${station.hex.x} | ${station.hex.y}`, true);

        //Capture Defense
        embed.addField('Capture Defense', `${station.capture_defense.has} / ${station.capture_defense.from}`, true);

        //Resources
        embed.addField('Station Resources', `${metal.toString()} ${station.resources.metal} ${gas.toString()} ${station.resources.gas} ${crystal.toString()} ${station.resources.crystal}`, false);
        embed.addField('Station Hidden Resources', `${metal.toString()} ${station.resources_hidden.metal} ${gas.toString()} ${station.resources_hidden.gas} ${crystal.toString()} ${station.resources_hidden.crystal}`, true)

        //Labor
        embed.addField('Labor', `'${station.fleet_labor}' / ${station.labor}`, true);

        //Station Cards
        var cardsString = '';
        if (station.cards.length === 0 || station.cards[0] === 'N/A') {
            embed.addField('Station Cards', 'N/A', false);
        } else {
            for (var i=0;i<station.cards.length;i++) {
                cardsString += `${station.cards[i].name}\n`;
            }
            embed.addField('Station Cards', `${cardsString}`, false);
        }

        //Buildings
        var buildingString = '';
        if (station.buildings.length === 0 || station.buildings[0] === 'N/A') {
            embed.addField('Buildings', 'N/A', false);
        } else {
            for (var i=0;i<station.buildings.length;i++) {
                buildingString += `${station.buildings[i].name} - Level ${station.buildings[i].level}\n`;
            }
            embed.addField('Buildings', `${buildingString}`, false);
        }

        //Outposts
        var outpostString = '';
        if (station.outposts.length === 0 || station.outposts[0] === 'N/A') {
            embed.addField('Outposts', 'N/A', false);
        } else {
            for (var i=0;i<station.outposts.length;i++) {
                outpostString += `${station.outposts[i].name} - Level ${station.outposts[i].level} - ${station.outposts[i].status}\n`;
            }
            embed.addField('Outposts', `${outpostString}`, false);
        }

        //Fleets
        var fleetString = '';
        if (station.fleets.length === 0 || station.fleets[0] === 'N/A') {
            embed.addField('Fleets', 'N/A', false);
        } else {
            var counter = 1;
            var tempString = '';
            for (var i=0;i<station.fleets.length;i++) {
                tempString = '';
                if (station.fleets[i].cards != undefined) {
                    tempString += `${station.fleets[i].count} ${station.fleets[i].type}\nCards: `;
                    let length = station.fleets[i].cards.length;
                    for (var l=0; l<length; l++) {
                        if (l === length-1) {
                            tempString += `${station.fleets[i].cards[l].name}\n`;
                        } else {
                            tempString += `${station.fleets[i].cards[l].name} | `;
                        }
                    }
                } else {
                    tempString += `${station.fleets[i].count} ${station.fleets[i].type}\n`;
                }
                if (station.fleets[i].player_name != undefined) {
                    tempString += `From: ${station.fleets[i].player_name}\n`;
                }
                if (fleetString.length + tempString.length >= 1020) {
                    embed.addField(`Fleets ${counter}`, `${fleetString}`, false);
                    counter++;
                    fleetString = '';
                }
                fleetString += tempString;
            }
            if (counter === 1) {
                embed.addField('Fleets', `${fleetString}`, false);
            } else {
                embed.addField(`Fleets ${counter}`, `${fleetString}`, false);
                counter++;
                fleetString = '';
            }
        }

        //Construction Queues
        var constructionString = '';
        if (!(station.construction.buildprogress === 'N/A')) {
            for (var i=0;i<station.construction.buildings.length;i++) {
                constructionString += `${station.construction.buildings[i].name} - Level: ${station.construction.buildings[i].level}\n`;
            }
            embed.addField(`Building Queue ${station.construction.buildprogress}%`, constructionString, false);
        }
        constructionString = '';
        if (!(station.construction.shipprogress === 'N/A')) {
            for (var i=0;i<station.construction.ships.length;i++) {
                constructionString += `${station.construction.ships[i].count} ${station.construction.ships[i].name}\n`;
            }
            embed.addField(`Ship Queue ${station.construction.shipprogress}%`, constructionString, false);
        }

        //Hangar
        var hangarString = '';
        if (station.hangar.length === 0 || station.hangar[0] === 'N/A') {
            embed.addField('Hangar', 'N/A', false);
        } else {
            for (var i=0;i<station.hangar.length;i++) {
                hangarString += `${station.hangar[i].name} ${station.hangar[i].count}\n`;
            }
            embed.addField('Hangar', `${hangarString}`, false);
        }

        //Fleet Stats
        embed.addField(`Raw Fleet Stats`, `FP: ${parseInt(station.fleet_fp_base,10)}\nHP: ${parseInt(station.fleet_hp_base,10)}\nCargo: ${parseInt(station.fleet_cargo_base,10)}\nBombing: ${parseInt(station.fleet_bombing_base,10)}`);
        //Min Fleet Stats With Cards
        embed.addField(`Min Fleet Stats w/ Cards`, `FP: ${parseInt(station.fleet_fp_min,10)}\nHP: ${parseInt(station.fleet_hp_min,10)}\nCargo: ${parseInt(station.fleet_cargo_min,10)}\nBombing: ${parseInt(station.fleet_bombing_min,10)}`);
        //Max Level Stats with cards
        embed.addField(`Max Level Bonus Fleet Stats w/ Cards`, `FP: ${parseInt(station.fleet_fp_max,10)}\nHP: ${parseInt(station.fleet_hp_max,10)}\nCargo: ${parseInt(station.fleet_cargo_max,10)}\nBombing: ${parseInt(station.fleet_bombing_max,10)}`);


        console.log(`# ${msg.guild.name}#${msg.channel.name}|${msg.channel.id} - ${msg.author.username}#${msg.author.discriminator}`);
    }
    catch (err) {
        var embed = 'ERROR';
        console.log('ERROR', station);
        console.log(err);
    }
    return embed;
}

module.exports = createReportEmbed;