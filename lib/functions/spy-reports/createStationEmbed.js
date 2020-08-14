const Discord = require('discord.js');

module.exports = {
    name: 'spyCreateStationEmbed',
    run: async ({station, user, detailed}) => new Promise((resolve) => {
        try {
            var embed = new Discord.MessageEmbed();
            embed.setAuthor(user.username, user.displayAvatarURL());
    
            embed.setTitle(`Spy Report sent from ${user.username}${(station.name != undefined)?' - '+station.name:''}`);
            embed.setDescription(station.description);
    
            embed.setColor(0x4a6af7);
    
            embed.setThumbnail(client.user.displayAvatarURL());
    
            //FIELDS
            //Hex
            embed.addField('Hex', `${station.hex.x} | ${station.hex.y} /goto ${station.hex.x} ${station.hex.y}`, true);
    
            //Capture Defense
            embed.addField('Capture Defense', `${station.capture_defense.has} / ${station.capture_defense.from}`, true);
    
            //Resources
            embed.addField('Station Resources', `<:726424578087321670:730112326312919061> ${station.resources.metal} <:726424578087321670:730112326237421661> ${station.resources.gas} <:726424578087321670:730112326682017863> ${station.resources.crystal}`, false);
            embed.addField('Station Hidden Resources', `<:726424578087321670:730112326312919061> ${station.resources_hidden.metal} <:726424578087321670:730112326237421661> ${station.resources_hidden.gas} <:726424578087321670:730112326682017863> ${station.resources_hidden.crystal}`, true)
    
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
            if (detailed) {
                var fleetString = '';
                if (station.fleets.length === 0 || station.fleets[0] === 'N/A') {
                    embed.addField('Fleets', 'N/A', false);
                } else {
                    var counter = 1;
                    var tempString = '';
                    for (var i=0;i<station.fleets.length;i++) {
                        tempString = '';
                        var extra = '';
                        if (station.fleets[i].cards != undefined) {
                            if (station.fleets[i].player_name != undefined) {
                                extra = ` from ${station.fleets[i].player_name}`;
                            }
                            tempString += `${station.fleets[i].count} ${station.fleets[i].type}${extra}\nCards: `;
                            let length = station.fleets[i].cards.length;
                            for (let l=0; l<length; l++) {
                                if (l === length-1) {
                                    tempString += `${station.fleets[i].cards[l].name}\n`;
                                } else {
                                    tempString += `${station.fleets[i].cards[l].name} | `;
                                }
                            }
                        } else {
                            if (station.fleets[i].player_name != undefined) {
                                extra = ` from ${station.fleets[i].player_name}\n`;
                            }
                            tempString += `${station.fleets[i].count} ${station.fleets[i].type}${extra}`;
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
                    }
                }
            } else {
                let fleetString = '';
                if (station.generalised.length == 0) {
                    embed.addField('Fleets', 'N/A', false);
                } else {
                    let counter = 1;
                    let tempString = '';
                    for (let i=0; i<station.generalised.length; i++) {
                        tempString = '';
                        if (station.generalised[i].name != null) {
                            tempString += station.generalised[i].name + '\n'
                        }
                        for (let j=0; j<station.generalised[i].ships.length; j++) {
                            tempString += `-${station.generalised[i].ships[j].type} ${station.generalised[i].ships[j].count}\n`;
                        }
                        if (fleetString.length + tempString.length >= 1020) {
                            embed.addField(`Fleets ${counter}`, `${fleetString}`, false);
                            counter++;
                            fleetString = '';
                        }
                        fleetString += tempString+'\n';
                    }
                    if (counter === 1) {
                        embed.addField('Fleets', `${fleetString}`, false);
                    } else {
                        embed.addField(`Fleets ${counter}`, `${fleetString}`, false);
                    }
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
    
    
            //console.log(`# ${msg.guild.name}#${msg.channel.name}|${msg.channel.id} - ${user.username}#${user.discriminator}`);
        }
        catch (err) {
            var embed = 'ERROR';
            console.log('ERROR', station);
            console.log(err);
        }
        resolve(embed);
    })
}