//IMPORTING MOST MODULES
const Discord = require('discord.js');
const config = require('./config.json');
const Bot = new Discord.Client();
const http = require('http');
const server = http.createServer(function(request, response) {});
global.data = {
    shipData: require('./information/ships.json'),
    cardData: require('./information/cards.json')
};
global.lib = require('./lib');

/**
 * Returns Calculations for Cards of a Fleet
 * @param {String} cardName Card Name
 * @param 
 */
function getCardStats(cardName) {
    if (cardName == null || cardName == undefined) return -1;

    var id = -1;
    for (var k=0; k<cardData.length; k++) {
        if (cardData[k].name === cardName) {
            id = k;
        }
    }

    if (id === -1) {
        return -1;
    } else {
        return cardData[id];
    }
}

/**
 * 
 * @param {Integer} xa StartingHex X
 * @param {Integer} xb StartingHex Y
 * @param {Integer} ya EndingHex X
 * @param {Integer} yb EndingHex Y
 */
function hexDistance(xa, xb, ya, yb) {
    return (Math.abs(xa - ya) + Math.abs(xa + xb - ya - yb) + Math.abs(xb - yb))/2;
}

/**
 * Makes an embed out of a Station Object
 * @param {Object} StationObject
 * @param {Object} DiscordMessageObject
 */
function createEmbed(station, msg) {

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
        embed.addField('Labor', `${station.fleet_labor} / ${station.labor}`, true);

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
        embed.addField(`Min Fleet Stats`, `FP: ${parseInt(station.fleet_fp,10)}\nHP: ${parseInt(station.fleet_hp,10)}\nCargo: ${parseInt(station.fleet_cargo,10)}\nBombing: ${parseInt(station.fleet_bombing,10)}`);

        console.log(`# ${msg.guild.name}#${msg.channel.name}|${msg.channel.id} - ${msg.author.username}#${msg.author.discriminator}`);
    }
    catch (err) {
        var embed = 'ERROR';
        console.log('ERROR', station);
        console.log(err);
    }
    return embed;
}



//WEBSOCKETSERVER
var reports = [];
var codeArr = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];

server.listen(22277, function() {
    console.log((new Date()) + ' Server is listening on port 22277');
})

const WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
    httpServer: server
})

var count = 0;
var clients = {};

wsServer.on('request', (r) => {
    var connection = r.accept('echo-protocol', r.origin);

    var id = count++;
    clients[id] = connection;

    //console.log((new Date()) + ' Connection accepted [' + id + ']');

    connection.on('message', (message) => {
        var msg = message.utf8Data;
        if (msg.startsWith('Spy Report on hex') || msg.startsWith('DEBUG Spy Report on hex')) {
            let station = lib.fnc.getStationInformation(msg);
            var codeWorking = false;
            var code = '';
            while (!codeWorking) {
                var codeFound = false;
                code = '';
                for (var i=0;i<6;i++) {
                    code += codeArr[Math.floor(Math.random() * 36)];
                }
                for (var i=0;i<reports.length;i++) {
                    if (reports[i].code == code) {
                        codeFound = true;
                    }
                }
                if (!codeFound) codeWorking = true;
            }
            reports.push({code: code, data: station, msg: msg});
            clients[id].send(code);
            console.log(`+ ${code}`);
        }
    });

    connection.on('close', (reasonCode, description) => {
        delete clients[id];
        //console.log((new Date())+ ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
})


//DISCORD BOT
Bot.on("message", (msg) => {

    if (msg.author.bot) return;

    if (msg.channel.name.includes('spy-data') || msg.channel.name.includes('spy-report')) {
        if (msg.content.startsWith('Spy Report on hex')) {
            try {
                
                var station = lib.fnc.getStationInformation(msg.content);

                if (station != 'error') {
                    msg.delete();
                    let embed = createEmbed(station, msg);
                    try {
                        msg.channel.send(embed);
                    }
                    catch (err) {
                        console.log(err);
                        console.log(station);
                    }
                }
                

                
            }
            catch (err) {
                console.log(err,"\n\n");
            }
            return;
        }

        for (var i=0;i<reports.length;i++) {
            if (msg.content.startsWith(reports[i].code)) {
                if (msg.content.includes('DEBUG')) console.log(reports[i].data);
                try {
                    let embed = createEmbed(reports[i].data, msg);
                    msg.channel.send(embed)
                }
                catch (err) {
                    console.log(err);
                    console.log(station);
                }
                console.log(`- ${reports[i].code}`);
                reports.splice(i,1);
                msg.delete();
                return;
            }
        }
    }

    if (!(msg.content.startsWith(config.prefix))) return;

    let args = msg.content.slice(config.prefix.length).split(' ');
    let command = args.splice(0,1).toString().toLowerCase();

    switch (command) {
        case 'travel':

            //REGEX DECLARATION
            let rgxSHex = new RegExp('(?<=-startHex )[0-9\\-\\,]*');
            let rgxEHex = new RegExp('(?<=-endHex )[0-9\\-\\,]*');
            let rgxSpeed = new RegExp('(?<=-speed )[0-9\\.]*');
            let rgxTime = new RegExp('(?<=-time )[0-9\\:]*');
            let rgxETA = new RegExp('(?<=-eta )[0-9\\:]*');
            let rgxDistance = new RegExp('(?<=-distance )[0-9\\.]*');
            let rgxStargate = new RegExp('(?<=-stargate )[0-9\\.]*');

            //REGEX INFO VARIABLE DECLERATION
            var sHex = -1, eHex = -1, speed = -1, time = -1, eta = -1, distance = -1, stargate = -1;

            //GETTING ALL THE INFOS FROM THE MESSAGE
            argsFull = args.join(' ');
            //EITHER DISTANCE OR HEXES
            var match = argsFull.match(rgxDistance);
            if (lib.fnc.mc(match)) {
                distance = parseInt(match[0], 10);
            } else {
                match = argsFull.match(rgxSHex);
                if (lib.fnc.mc(match)) {
                    sHex = match[0].split(',');
                    match = argsFull.match(rgxEHex);
                    if (lib.fnc.mc(match)) {
                        eHex = match[0].split(',');
                    }
                }
            }
            //SPEED
            match = argsFull.match(rgxSpeed);
            if (lib.fnc.mc(match)) {
                speed = parseFloat(match[0]);
            }
            //STARGATE
            match = argsFull.match(rgxStargate);
            if (lib.fnc.mc(match)) {
                stargate = parseFloat(match[0]);
            }
            //TIMES
            match = argsFull.match(rgxTime);
            if (lib.fnc.mc(match)) {
                time = match[0].split(':');
                match = argsFull.match(rgxETA);
                if (lib.fnc.mc(match)) {
                    eta = match[0].split(':');
                }
            }

            //CHECKS AND TRANSFORMS
            //SPEED
            if (speed === -1) return;

            //HEXES
            if ((distance == -1 && sHex == -1 && eHex == -1) || (eHex.length == undefined && sHex.length == undefined && distance == -1) || (sHex.length != 2 && eHex.length != 2 && distance == -1)) return;
            if (sHex.length === 2 && eHex.length === 2) {
                sHex[0] = parseInt(sHex[0], 10);
                sHex[1] = parseInt(sHex[1], 10);
                eHex[0] = parseInt(eHex[0], 10);
                eHex[1] = parseInt(eHex[1], 10);
            }

            //CURRENT TIME
            var cTime = [0,0,0];
            if (time != -1) {
                if (time.length !== 3) {
                    return;
                } else if (time.length === 3) {
                    cTime[0] = (!(time[0]>23)) ? parseInt(time[0], 10) : 0;
                    cTime[1] = (!(time[1]>59)) ? parseInt(time[1], 10) : 0;
                    cTime[2] = (!(time[2]>59)) ? parseInt(time[2], 10) : 0;
                }
            }

            //ETA
            var cETA = [0,0,0,0];
            if (eta != -1) {
                if (eta.length > 4) {
                    return;
                } else if (eta.length === 4) {
                    cETA[0] = parseInt(eta[0], 10);
                    cETA[1] = parseInt(eta[1], 10);
                    cETA[2] = parseInt(eta[2], 10);
                    cETA[3] = parseInt(eta[3], 10);
                } else if (eta.length === 3) {
                    cETA[0] = parseInt(0, 10);
                    cETA[1] = parseInt(eta[0], 10);
                    cETA[2] = parseInt(eta[1], 10);
                    cETA[3] = parseInt(eta[2], 10);
                } else if (eta.length === 2) {
                    cETA[0] = parseInt(0, 10);
                    cETA[1] = parseInt(0, 10);
                    cETA[2] = parseInt(eta[0], 10);
                    cETA[3] = parseInt(eta[1], 10);
                } else if (eta.length === 1) {
                    cETA[0] = parseInt(0, 10);
                    cETA[1] = parseInt(0, 10);
                    cETA[2] = parseInt(0, 10);
                    cETA[3] = parseInt(eta[0], 10);
                }
            }

            //CALCULATIONS OF TRAVEL TIME
            if (distance === -1) {
                distance = hexDistance(sHex[0],sHex[1],eHex[0],eHex[1]);
            }
            var travel_once = [0,0,0,0,0];
            var travel_once_stargate = [0,0,0,0,0];
            var travel_twice = [0,0,0,0,0];
            if (stargate === -1) {
                let hex_per_min = 60/(speed/3600);
                var raw_time = ((distance*hex_per_min)/60).toFixed(3);
                let days = ~~(raw_time/(24*3600));
                raw_time %= 24*3600;
                let hours = ~~(raw_time/3600);
                raw_time %= 3600;
                let minutes = ~~(raw_time/60);
                raw_time %= 60;
                let seconds = ~~raw_time;
                raw_time %= 1;
                let milseconds = Math.floor(raw_time*1000);
                travel_once = [days, hours, minutes, seconds, milseconds];
                travel_twice = [days*2, hours*2, minutes*2, seconds*2, milseconds*2];
            } else if (stargate > 0) {
                var hex_per_min = 60/(speed/3600);
                var raw_time = ((distance*hex_per_min)/60).toFixed(3);
                var days = ~~(raw_time/(24*3600));
                raw_time %= 24*3600;
                var hours = ~~(raw_time/3600);
                raw_time %= 3600;
                var minutes = ~~(raw_time/60);
                raw_time %= 60;
                var seconds = ~~raw_time;
                raw_time %= 1;
                var milseconds = Math.floor(raw_time*1000);
                travel_once = [days, hours, minutes, seconds, milseconds];
                var hex_per_min = 60/((stargate+speed)/3600);
                var raw_time = ((distance*hex_per_min)/60).toFixed(3);
                var days = ~~(raw_time/(24*3600));
                raw_time %= 24*3600;
                var hours = ~~(raw_time/3600);
                raw_time %= 3600;
                var minutes = ~~(raw_time/60);
                raw_time %= 60;
                var seconds = ~~raw_time;
                raw_time %= 1;
                var milseconds = Math.floor(raw_time*1000);
                travel_once_stargate = [days, hours, minutes, seconds, milseconds];
                travel_twice = [days+travel_once[0], hours+travel_once[1], minutes+travel_once[2], seconds+travel_once[3], milseconds+travel_once[4]];
            }

            if (travel_twice[4] >= 1000) {
                travel_twice[3] += 1;
                travel_twice[4] -= 1000;
            }
            if (travel_twice[3] >= 60) {
                travel_twice[2] += 1;
                travel_twice[3] -= 60;
            }
            if (travel_twice[2] >= 60) {
                travel_twice[1] += 1;
                travel_twice[2] -= 60;
            }
            if (travel_twice[1] >= 24) {
                travel_twice[0] += 1;
                travel_twice[1] -= 24;
            }

            //EXTRA TIME CALCS
            var pTime = [0,0,0,0,0];
            var pHome = [0,0,0,0,0];
            if (eta != -1 && time != -1) {
                pTime = [cETA[0], cETA[1], cETA[2], cETA[3], 0];
                if (stargate === -1) {
                    pHome = [cETA[0]+travel_once[0], cETA[1]+travel_once[1], cETA[2]+travel_once[2], cETA[3]+travel_once[3], 0+travel_once[4]];
                } else {
                    pHome = [cETA[0]+travel_once_stargate[0], cETA[1]+travel_once_stargate[1], cETA[2]+travel_once_stargate[2], cETA[3]+travel_once_stargate[3], 0+travel_once_stargate[4]];
                }

                do {
                    if (pHome[4] >= 1000) {
                        pHome[3] += 1;
                        pHome[4] -= 1000;
                    }
                } while (pHome[4] >= 1000);
                do {
                    if (pHome[3] >= 60) {
                        pHome[2] += 1;
                        pHome[3] -= 60;
                    }
                } while (pHome[3] >= 60);
                do {
                    if (pHome[2] >= 60) {
                        pHome[1] += 1;
                        pHome[2] -= 60;
                    }
                } while (pHome >= 60);
                do {
                    if (pHome[1] >= 24) {
                        pHome[0] += 1;
                        pHome[1] -= 24;
                    }
                } while (pHome >= 24);
            } else if (time != -1) {
                pTime = [0+travel_once[0], cTime[0]+travel_once[1], cTime[1]+travel_once[2], cTime[2]+travel_once[3], 0+travel_once[4]];
                pHome = [0+travel_twice[0], cTime[0]+travel_twice[1], cTime[1]+travel_twice[2], cTime[2]+travel_twice[3], 0+travel_twice[4]];
                do {
                    if (pHome[4] >= 1000) {
                        pHome[3] += 1;
                        pHome[4] -= 1000;
                    }
                } while (pHome[4] >= 1000);
                do {
                    if (pHome[3] >= 60) {
                        pHome[2] += 1;
                        pHome[3] -= 60;
                    }
                } while (pHome[3] >= 60);
                do {
                    if (pHome[2] >= 60) {
                        pHome[1] += 1;
                        pHome[2] -= 60;
                    }
                } while (pHome >= 60);
                do {
                    if (pHome[1] >= 24) {
                        pHome[0] += 1;
                        pHome[1] -= 24;
                    }
                } while (pHome >= 24);

                do {
                    if (pTime[4] >= 1000) {
                        pTime[3] += 1;
                        pTime[4] -= 1000;
                    }
                } while (pTime[4] >= 1000);
                do {
                    if (pTime[3] >= 60) {
                        pTime[2] += 1;
                        pTime[3] -= 60;
                    }
                } while (pTime[3] >= 60);
                do {
                    if (pTime[2] >= 60) {
                        pTime[1] += 1;
                        pTime[2] -= 60;
                    }
                } while (pTime >= 60);
                do {
                    if (pTime[1] >= 24) {
                        pTime[0] += 1;
                        pTime[1] -= 24;
                    }
                } while (pTime >= 24);
            } else {
                pTime = [travel_once[0], travel_once[1], travel_once[2], travel_once[3], travel_once[4]];
                pHome = [travel_twice[0], travel_twice[1], travel_twice[2], travel_twice[3], travel_twice[4]];
                do {
                    if (pHome[4] >= 1000) {
                        pHome[3] += 1;
                        pHome[4] -= 1000;
                    }
                } while (pHome[4] >= 1000);
                do {
                    if (pHome[3] >= 60) {
                        pHome[2] += 1;
                        pHome[3] -= 60;
                    }
                } while (pHome[3] >= 60);
                do {
                    if (pHome[2] >= 60) {
                        pHome[1] += 1;
                        pHome[2] -= 60;
                    }
                } while (pHome >= 60);
                do {
                    if (pHome[1] >= 24) {
                        pHome[0] += 1;
                        pHome[1] -= 24;
                    }
                } while (pHome >= 24);

                do {
                    if (pTime[4] >= 1000) {
                        pTime[3] += 1;
                        pTime[4] -= 1000;
                    }
                } while (pTime[4] >= 1000);
                do {
                    if (pTime[3] >= 60) {
                        pTime[2] += 1;
                        pTime[3] -= 60;
                    }
                } while (pTime[3] >= 60);
                do {
                    if (pTime[2] >= 60) {
                        pTime[1] += 1;
                        pTime[2] -= 60;
                    }
                } while (pTime >= 60);
                do {
                    if (pTime[1] >= 24) {
                        pTime[0] += 1;
                        pTime[1] -= 24;
                    }
                } while (pTime >= 24);
            }

            //EMBED CREATION
            let embed = new Discord.MessageEmbed();
            embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL());
            embed.setThumbnail(Bot.user.displayAvatarURL());
            embed.setColor(0x5cc3ff);
            embed.setTitle('Travel Time Calculator');
            embed.setDescription(msg.content);
            if (sHex != -1 && eHex != -1) {
                embed.addField(':regional_indicator_a: Starting Hex', `${sHex[0]} | ${sHex[1]}`, true);
                embed.addField(':regional_indicator_b: Ending Hex', `${eHex[0]} | ${eHex[1]}`, true);
            }
            embed.addField(':stopwatch: Speed', `${speed}`, true);
            if (stargate != -1) {
                embed.addField(':stopwatch: Return Speed', `${speed+stargate}`, true);
            }
            embed.addField(':left_right_arrow: Distance', `${distance}`, true);
            if (eta != -1 && time != -1) {
                embed.addField(':clock10: Current Time', `${(cTime[0] <10)?'0'+cTime[0]:cTime[0]}:${(cTime[1] <10)?'0'+cTime[1]:cTime[1]}:${(cTime[2] <10)?'0'+cTime[2]:cTime[2]}`, false);
                embed.addField(':inbox_tray: ETA', `${(pTime[0] <10)?'0'+pTime[0]:pTime[0]}:${(pTime[1] <10)?'0'+pTime[1]:pTime[1]}:${(pTime[2] <10)?'0'+pTime[2]:pTime[2]}:${(pTime[3] <10)?'0'+pTime[3]:pTime[3]}.${(pTime[4] <10)?'0'+pTime[4]:pTime[4]}`, false);
                embed.addField(':outbox_tray: Back Home', `${(pHome[0] <10)?'0'+pHome[0]:pHome[0]}:${(pHome[1] <10)?'0'+pHome[1]:pHome[1]}:${(pHome[2] <10)?'0'+pHome[2]:pHome[2]}:${(pHome[3] <10)?'0'+pHome[3]:pHome[3]}.${(pHome[4] <10)?'00'+pHome[4]:(pHome[4] <100)?'0'+pHome[4]:pHome[4]}`, false);
            } else if (time != -1) {
                embed.addField(':clock10: Current Time', `${(cTime[0] <10)?'0'+cTime[0]:cTime[0]}:${(cTime[1] <10)?'0'+cTime[1]:cTime[1]}:${(cTime[2] <10)?'0'+cTime[2]:cTime[2]}`, false);
                embed.addField(':inbox_tray: ETA', `${(pTime[0] <10)?'0'+pTime[0]:pTime[0]}:${(pTime[1] <10)?'0'+pTime[1]:pTime[1]}:${(pTime[2] <10)?'0'+pTime[2]:pTime[2]}:${(pTime[3] <10)?'0'+pTime[3]:pTime[3]}.${(pTime[4] <10)?'0'+pTime[4]:pTime[4]}`, false);
                embed.addField(':outbox_tray: Back Home', `${(pHome[0] <10)?'0'+pHome[0]:pHome[0]}:${(pHome[1] <10)?'0'+pHome[1]:pHome[1]}:${(pHome[2] <10)?'0'+pHome[2]:pHome[2]}:${(pHome[3] <10)?'0'+pHome[3]:pHome[3]}.${(pHome[4] <10)?'00'+pHome[4]:(pHome[4] <100)?'0'+pHome[4]:pHome[4]}`, false);
            } else {
                embed.addField(':inbox_tray: Travel To', `${(travel_once[0] <10)?'0'+travel_once[0]:travel_once[0]}:${(travel_once[1] <10)?'0'+travel_once[1]:travel_once[1]}:${(travel_once[2] <10)?'0'+travel_once[2]:travel_once[2]}:${(travel_once[3] <10)?'0'+travel_once[3]:travel_once[3]}.${(travel_once[4] <10)?'0'+travel_once[4]:travel_once[4]}`, false);
                embed.addField(':outbox_tray: Back Home', `${(travel_twice[0] <10)?'0'+travel_twice[0]:travel_twice[0]}:${(travel_twice[1] <10)?'0'+travel_twice[1]:travel_twice[1]}:${(travel_twice[2] <10)?'0'+travel_twice[2]:travel_twice[2]}:${(travel_twice[3] <10)?'0'+travel_twice[3]:travel_twice[3]}.${(travel_twice[4] <10)?'00'+travel_twice[4]:(travel_twice[4] <100)?'0'+travel_twice[4]:travel_twice[4]}`, false);
            }
            
            try {
                msg.channel.send(embed);
                msg.delete();
            } 
            catch (err) {
                console.log(err);
                msg.channel.send('ERROR');
            }
            break;
    }
});

Bot.on("guildCreate", (guild) => {
    console.log(`+ ${guild.name} - ${guild.owner.user.username}#${guild.owner.user.discriminator}`);
})

Bot.on("guildDelete", (guild) => {
    console.log(`- ${guild.name} - ${guild.owner.user.username}#${guild.owner.user.discriminator}`);
})

var oldInterval = -1;

Bot.on("ready", () => {
    console.log(`BOT CONNECTED TO...`);
    Bot.guilds.cache.forEach((guild) => {
        console.log(`> ${guild.name} | ${guild.owner.user.username}#${guild.owner.user.discriminator}`);
    })
    Bot.user.setPresence({activity: {name: "BOOTING UP | CONNECTING"}, status: "idle"});
    if (oldInterval != -1) {
        clearInterval(oldInterval)
    }
    oldInterval = setInterval(()=>{
        var counter = 0;
        Bot.guilds.cache.forEach((guild) => {
            counter++;
        })
        Bot.user.setPresence({activity: {name: `${config.prefix}help | ${counter} Guilds`}, status: "online"});
    },60000);
})


Bot.login(config.discordToken);