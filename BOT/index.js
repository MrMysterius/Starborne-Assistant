//IMPORTING MOST MODULES
const Discord = require('discord.js');
const config = require('./config.json');
const Bot = new Discord.Client();
const http = require('http');
const server = http.createServer(function(request, response) {});
const shipData = require('./information/ships.json');
const cardData = require('./information/cards.json');



/**
 * mc > Match Check
 * Simply checks if the match even returned something
 * @param {Object} Match The the Object of a Match
 */
function mc(match) {
    if (match != null && match[0] != undefined) return true;
    return false;
}

/**
 * Calculates Base Stats
 * @param {String} Type Tpye of the Ships
 * @param {Integer} Count Count of the Ships
 */
function calcShipInfo(type, count) {
    var id = 'undefined';
    count = parseInt(count, 10);
    for (var i=0;i<shipData.length;i++) {
        if (type.includes(shipData[i].name)) {
            id = i;
        }
    }
    if (id === 'undefined') return false;
    let stats = {base_stats: {speed: "", fp: "", hp: "", cargo: "", scan: "", bombing: ""}, costs: {labor_cost: "", metal: "", gas: "", crystal: "", minutes: ""}, level_bonus: shipData[id].level_bonus}
    
    stats.base_stats.speed = parseInt(shipData[id].base_stats.speed) * count;
    stats.base_stats.fp = parseInt(shipData[id].base_stats.fp, 10) * count;
    stats.base_stats.hp = parseInt(shipData[id].base_stats.hp, 10) * count;
    stats.base_stats.cargo = parseInt(shipData[id].base_stats.cargo, 10) * count;
    stats.base_stats.scan = parseInt(shipData[id].base_stats.scan, 10) * count;
    stats.base_stats.bombing = parseInt(shipData[id].base_stats.bombing, 10) * count;

    stats.costs.labor_cost = parseInt(shipData[id].costs.labor_cost, 10) * count;
    stats.costs.metal = parseInt(shipData[id].costs.metal, 10) * count;
    stats.costs.gas = parseInt(shipData[id].costs.gas, 10) * count;
    stats.costs.crystal = parseInt(shipData[id].costs.crystal, 10) * count;
    stats.costs.minutes = parseInt(shipData[id].costs.minutes, 10) * count;

    return stats;
}

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

//FUNCTION DECLARATION
/** 
 * Gets the Information out of a spy report
 * @param {String} reportString Spy Report as a String
 */
function getStationInformation(reportString) {
    try {
        let station = {};
        let regex = {};
        var match;

        //Description Header
        station.description = 'N/A';
        regex.description = new RegExp('(?=Spy Report)[\\n\\s\\S\\r]*(?=\\n\\nCapture Defense:)');
        match = reportString.match(regex.description);
        if (match != null && match[0] != undefined) {
            station.description = match[0];
        }

        //Hex
        station.hex = {x: 'N/A', y: 'N/A'}
        regex.hex = new RegExp('(?<=hex \\()[^\\r\\n\\t\\f\\v]*(?=\\d*\\))');
        match = reportString.match(regex.hex);
        if (match != null && match[0] != undefined) {
            let arr = match[0].split(',');
            station.hex.x = arr[0];
            station.hex.y = arr[1];
        }
 
        //Capture Defense
        station.capture_defense = {has: 'N/A', from: 'N/A'};
        regex.capture_defense = new RegExp('(?<=Capture Defense: )[^\\r\\n\\t\\f\\v]*');
        match = reportString.match(regex.capture_defense);
        if (match != null && match[0] != undefined) {
            let arr = match[0].split('/');
            station.capture_defense.has = arr[0];
            station.capture_defense.from = arr [1];
        }

        //Station Resources
        station.resources = {metal: 'N/A', gas: 'N/A', crystal: 'N/A'};
        regex.resources = new RegExp('(?<=Station Resources: \\n)[^\\r\\n\\f\\v]*')
        regex.metal = new RegExp('(?<=Metal )\\d*');
        regex.gas = new RegExp('(?<=Gas )\\d*');
        regex.crystal = new RegExp('(?<=Crystal )\\d*');
        match = reportString.match(regex.resources);
        if (match != null && match[0] != undefined) {
            let metal = match[0].match(regex.metal);
            let gas = match[0].match(regex.gas);
            let crystal = match[0].match(regex.crystal);
            if (metal != null && metal[0] != undefined) station.resources.metal = metal[0];
            if (gas != null && gas[0] != undefined) station.resources.gas = gas[0];
            if (crystal != null && crystal[0] != undefined) station.resources.crystal = crystal[0];
        }
        
        //Cards
        station.cards = ['N/A'];
        regex.cards = new RegExp('(?<=Cards: \\n)[^\\r\\n\\t\\f\\v\\.]*');
        regex.card_names = new RegExp("cardTooltip\\(\\d*\\)[A-Za-z0-9\\ \\'\\-]*", 'gm');
        match = reportString.match(regex.cards);
        if (match != null && match[0] != undefined) {
            station.cards = [];
            match = match[0].match(regex.card_names);
            if (match != null && match[0] != undefined) {
                for (var i=0;i<match.length;i++) {
                    let arr = match[i].split(' ');
                    for (var k=0;k<arr.length;k++) {
                        if (arr[k].startsWith('cardTooltip')) {
                            arr.splice(k,1);
                        }
                    }
                    match[i] = arr.join(' ');
                    station.cards.push({name: match[i]});
                }
            }
        }

        //Labor
        station.labor = 'N/A';
        regex.labor = new RegExp('(?<=Labor: \\n)[^\\r\\n\\t\\f\\v]*');
        regex.labor_count = new RegExp('Labor \\d*');
        match = reportString.match(regex.labor);
        if (match != null && match[0] != undefined) {
            match = match[0].match(regex.labor_count);
            if (match != null && match[0] != undefined) {
                let arr = match[0].split(' ');
                station.labor = arr[1];
            }
        }

        //Buildings
        station.buildings = ['N/A'];
        regex.buildings_faction = new RegExp('(?<=Buildings: \\n)[\\n\\s\\S\\r]*(?=\\nConstruction Queues:)');
        regex.buildings_nofaction = new RegExp('(?<=Buildings: \\n)[\\n\\s\\S\\r]*(?=\\nStation Hidden Resources:)');
        regex.building_names = new RegExp("[A-Za-z'\\ \\.]* - Level: \\d*", 'gm');
        match = reportString.match(regex.buildings_faction);
        if (match == null || match[0] == undefined) match = reportString.match(regex.buildings_nofaction);
        if (match != null && match[0] != undefined) {
            station.buildings = [];
            match = match[0].match(regex.building_names);
            if (match != null && match[0] != undefined) {
                for (var i=0;i<match.length;i++) {
                    let arr = match[i].split(' - Level: ');
                    station.buildings.push({name: arr[0], level: arr[1]});
                }
                
            }
        }

        //Station Hidden Resources
        station.resources_hidden = {metal: 'N/A', gas: 'N/A', crystal: 'N/A'};
        regex.resources_hidden = new RegExp('(?<=Station Hidden Resources: \\n)[^\\r\\n\\f\\v]*');
        match = reportString.match(regex.resources_hidden);
        if (match != null && match[0] != undefined) {
            let metal = match[0].match(regex.metal);
            let gas = match[0].match(regex.gas);
            let crystal = match[0].match(regex.crystal);
            if (metal != null && metal[0] != undefined) station.resources_hidden.metal = metal[0];
            if (gas != null && gas[0] != undefined) station.resources_hidden.gas = gas[0];
            if (crystal != null && crystal[0] != undefined) station.resources_hidden.crystal = crystal[0];
        }

        //Outposts
        station.outposts = ['N/A'];
        regex.outposts = new RegExp('(?<=Outposts: \\n)[\\n\\s\\S\\r]*(?=\\n\\nFleets:)');
        regex.outpost_names = new RegExp("[A-Za-z\\ ']* - Level \\d* - [A-Za-z\\ ']*", 'gm');
        match = reportString.match(regex.outposts);
        if (match != null && match[0] != undefined) {
            station.outposts = [];
            match = match[0].match(regex.outpost_names);
            if (match != null && match[0] != undefined) {
                for (var i=0;i<match.length;i++) {
                    var arr = match[i].split(' - ');
                    arr[1] = arr[1].replace('Level ', '');
                    station.outposts.push({name: arr[0], level: arr[1], status: arr[2]});
                }
            }
        }

        //Fleets
        station.fleets = ['N/A'];
        regex.fleets = new RegExp('(?<=Fleets: \\n)[\\n\\s\\S\\r]*(?=\\n\\nHangar:)');
        regex.fleets_detail = new RegExp("\\d* [A-Za-z\\ ']*\\nCards: [A-Za-z0-9\\ '\\(\\)\\,\\-]*\\.", 'gm');
        regex.fleets_names = new RegExp("\\d* [A-Za-z\\ ']*", 'gm');
        regex.fleets_names_alt = new RegExp("[A-Za-z\\ ']*", 'gm');
        match = reportString.match(regex.fleets);
        if (match != null && match != undefined) {
            station.fleets = [];
            if (station.cards[0] === 'N/A') {
                let oldMatch = match[0];
                match = oldMatch.match(regex.fleets_names);
                if (match != null && match[0] != undefined && match[0] != ' ') {
                    for (var i=0;i<match.length;i++) {
                        let arr = match[i].split(' ');
                        let count = arr.splice(0,1);
                        station.fleets.push({type: arr.join(' '), count: count[0]});
                    }
                } else {
                    match = oldMatch.match(regex.fleets_names_alt);
                    if (match != null && match[0] != undefined) {
                        for (var i=0;i<match.length;i++) {
                            if (match[i].length > 1) {
                                station.fleets.push({type: match[i], count: 'N/A'});
                            }
                        }
                    }
                }
            } else {
                match = match[0].match(regex.fleets_detail);
                if (match != null && match[0] != undefined) {
                    for (var i=0;i<match.length;i++) {
                        let arr = match[i].split('\n');
                        var fleetarr = arr[0].split(' ');
                        let count = fleetarr.splice(0,1);
                        if (fleetarr.join(' ') == 'Heavy Scouts') fleetarr = ['Recons'];
                        if (fleetarr.join(' ') == 'Heavy Scout') fleetarr = ['Recon'];
                        var pushObj = {type: fleetarr.join(' '), count: count[0], cards: []};
                        let card_match = arr[1].match(regex.card_names);
                        if (card_match != null && card_match[0] != undefined) {
                            for (var k=0;k<card_match.length;k++) {
                                let cardArr = card_match[k].split(' ');
                                for (var l=0;l<cardArr.length;l++) {
                                    if (cardArr[l].startsWith('cardTooltip')) {
                                        cardArr.splice(l,1);
                                    }
                                }
                                pushObj.cards.push({name: cardArr.join(' ')});
                            }
                        }
                        station.fleets.push(pushObj);
                    }
                }
            }
        }

        //Hangar
        station.hangar = ['N/A'];
        regex.hangar = new RegExp('(?<=Hangar: \\n)[\\s\\S]*');
        regex.hangar_detail = new RegExp("[A-Za-z\\ '\\(\\)]* \\d*", 'gm');
        match = reportString.match(regex.hangar);
        if (match != null && match[0] != undefined) {
            station.hangar = [];
            match = match[0].match(regex.hangar_detail);
            if (match != null && match[0] != undefined) {
                for (var i=0;i<match.length;i++) {
                    var arr = match[i].split(' ');
                    var pop = arr.pop();
                    station.hangar.push({name: arr.join(' '), count: pop});
                }
            }
        }

        //Construction Queues
        station.construction = {buildings: ['N/A'], buildprogress: 'N/A', ships: ['N/A'], shipprogress: 'N/A'};
        regex.construction = {};
        regex.construction.test = new RegExp('Construction Queues:');
        regex.construction.general = new RegExp('(?<=Construction Queues:\\n)[\\s\\S]*(?=\\n\\nStation Hidden Resources:)');
        regex.construction.buildings = new RegExp('(?<=Building Construction Queue:\\n)[\\s\\S]*(?=\\nFleet Construction Queue:)');
        regex.construction.building_details = new RegExp("[A-Za-z' ]* - Level: \\d*", 'gm');
        regex.construction.fleets = new RegExp('(?<=Fleet Construction Queue:\\n)[\\s\\S]*');
        regex.construction.fleet_details = new RegExp("\\d* [A-Za-z\\ ']*", 'gm')
        regex.construction.progress = new RegExp('\\d*(?=%)');
        match = reportString.match(regex.construction.test);
        if (mc(match)) {
            match = reportString.match(regex.construction.general);
            if (match != null && match[0] != undefined) {
                var buildMatch = match[0].match(regex.construction.buildings);
                var fleetMatch = match[0].match(regex.construction.fleets);
                if (buildMatch != null && buildMatch[0] != undefined) {
                    station.construction.buildings = [];
                    var progress = buildMatch[0].match(regex.construction.progress);
                    if (mc(progress)) {
                        station.construction.buildprogress = progress[0];
                        buildMatch[0] = buildMatch[0].replace(progress[0], '');
                        buildMatch = buildMatch[0].match(regex.construction.building_details);
                        if (mc(buildMatch)) {
                            for (var i=0;i<buildMatch.length;i++) {
                                let arr = buildMatch[i].split(' - Level: ');
                                station.construction.buildings.push({name: arr[0], level: arr[1]});
                            }
                        }
                    }
                }
                if (fleetMatch != null && fleetMatch[0] != undefined) {
                    station.construction.ships = [];
                    var progress = fleetMatch[0].match(regex.construction.progress);
                    if (mc(progress)) {
                        station.construction.shipprogress = progress[0];
                        fleetMatch[0] = fleetMatch[0].replace(progress[0], '')
                        fleetMatch = fleetMatch[0].match(regex.construction.fleet_details);
                        if (mc(fleetMatch)) {
                            for (var i=0;i<fleetMatch.length;i++) {
                                let arr = fleetMatch[i].split(' ');
                                station.construction.ships.push({name: arr[1], count: arr[0]});
                            }
                        }
                    }
                }
            }
        }

        //CALCULATIONS
        station.fleet_fp = 'N/A';
        station.fleet_hp = 'N/A';
        station.fleet_cargo = "N/A";
        station.fleet_bombing = "N/A";
        station.fleet_labor = "N/A";
        if (!(station.fleets.length === 0 || station.fleets[0] === 'N/A')) {
            station.fleet_fp = 0;
            station.fleet_hp = 0;
            station.fleet_cargo = 0;
            station.fleet_bombing = 0;
            station.fleet_labor = 0;
            for (var i=0;i<station.fleets.length;i++) {
                let temp = calcShipInfo(station.fleets[i].type, station.fleets[i].count);
                if (temp != false) {
                    station.fleets[i].stats = temp;
                    station.fleet_fp += parseInt(temp.base_stats.fp, 10);
                    station.fleet_hp += parseInt(temp.base_stats.hp, 10);
                    station.fleet_cargo += parseInt(temp.base_stats.cargo, 10);
                    station.fleet_bombing += parseInt(temp.base_stats.bombing, 10);
                    station.fleet_labor += parseInt(temp.costs.labor_cost, 10);
                }
            }
        }
        if (station.cards != null && station.cards != 'N/A') {
            for (var i=0; i<station.fleets.length; i++) {
                if (station.fleets[i].cards != null && station.fleets[i].cards != undefined) {
                    for (var k=0; k<station.fleets[i].cards.length; k++) {
                        let cardStats = getCardStats(station.fleets[i].cards[k].name)

                        if (cardStats !== -1) {
                            station.fleets[i].cards[k] = cardStats;
                        }
                    }
                }
            }
        }

        if (reportString.startsWith('DEBUG')) {
            console.log(station);
        }

        return station;
    }
    catch (err) {
        console.log(err);
        return 'error';
    }
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
            let station = getStationInformation(msg);
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
                
                var station = getStationInformation(msg.content);

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

            //REGEX INFO VARIABLE DECLERATION
            var sHex = -1, eHex = -1, speed = -1, time = -1, eta = -1;

            //GETTING ALL THE INFOS FROM THE MESSAGE
            argsFull = args.join(' ');
            var match = argsFull.match(rgxSHex);
            if (mc(match)) {
                sHex = match[0].split(',');
                match = argsFull.match(rgxEHex);
                if (mc(match)) {
                    eHex = match[0].split(',');
                    match = argsFull.match(rgxSpeed);
                    if (mc(match)) {
                        speed = parseFloat(match[0]);
                        match = argsFull.match(rgxTime);
                        if (mc(match)) {
                            time = match[0].split(':');
                            match = argsFull.match(rgxETA);
                            if (mc(match)) {
                                eta = match[0].split(':');
                            }
                        }
                    }
                }
            }

            //CHECKS AND TRANSFORMS
            //SPEED
            if (speed === -1) return;

            //HEXES
            if (sHex.length != 2 && eHex.length != 2) return;
            sHex[0] = parseInt(sHex[0], 10);
            sHex[1] = parseInt(sHex[1], 10);
            eHex[0] = parseInt(eHex[0], 10);
            eHex[1] = parseInt(eHex[1], 10);

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
            let distance = hexDistance(sHex[0],sHex[1],eHex[0],eHex[1]);
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

            let travel_once = [days, hours, minutes, seconds, milseconds];
            var travel_twice = [days*2, hours*2, minutes*2, seconds*2, milseconds*2];
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
                pHome = [cETA[0]+travel_once[0], cETA[1]+travel_once[1], cETA[2]+travel_once[2], cETA[3]+travel_once[3], 0+travel_once[4]];

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
            }

            //EMBED CREATION
            let embed = new Discord.MessageEmbed();
            embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL());
            embed.setThumbnail(Bot.user.displayAvatarURL());
            embed.setColor(0x5cc3ff);
            embed.setTitle('Travel Time Calculator');
            embed.setDescription(msg.content);
            embed.addField(':regional_indicator_a: Starting Hex', `${sHex[0]} | ${sHex[1]}`, true);
            embed.addField(':regional_indicator_b: Ending Hex', `${eHex[0]} | ${eHex[1]}`, true);
            embed.addField(':stopwatch: Speed', `${speed}`, true);
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

Bot.on("ready", () => {
    console.log(`BOT CONNECTED TO`);
    Bot.guilds.cache.forEach((guild) => {
        console.log(`> ${guild.name} | ${guild.owner.user.username}#${guild.owner.user.discriminator}`);
    })
})


Bot.login(config.discordToken);