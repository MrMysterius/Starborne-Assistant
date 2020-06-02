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
 * @param {Object} fleet Fleet as an object with Cards
 */
function calcCardStats(fleet) {
    if (fleet.cards == null || fleet.cards == undefined) return false;

    
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
        case 'time':
            if (args != null && args[0] != undefined && args[1] != undefined && args[1] === 'eta' && args[2] != undefined) {

                let current_time = args[0].split(':');
                let eta = args[2].split(':');

                var arrival = [0,0,0];
                arrival[0] = parseInt(current_time[0]) + parseInt(eta[0]);
                arrival[1] = parseInt(current_time[1]) + parseInt(eta[1]);
                arrival[2] = parseInt(current_time[2]) + parseInt(eta[2]);

                if (arrival[2] >= 60) {
                    arrival[2] -= 60;
                    arrival[1] += 1;
                }
                if (arrival[1] >= 60) {
                    arrival[1] -= 60;
                    arrival[0] += 1;
                }
                if (arrival[0] >= 24) {
                    arrival[0] -= 24;
                }

                if (arrival[0] < 10) arrival[0] = `0${arrival[0]}`;
                if (arrival[1] < 10) arrival[1] = `0${arrival[1]}`;
                if (arrival[2] < 10) arrival[2] = `0${arrival[2]}`;

                let embed = new Discord.MessageEmbed();
                embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL());
                embed.setColor(0x5cc3ff);
                embed.setTitle('Arrival Time Calculation');
                embed.setThumbnail(Bot.user.displayAvatarURL());
                embed.addField('Current Time', `${current_time[0]}:${current_time[1]}:${current_time[2]}`, true);
                embed.addField('ETA', `${eta[0]}:${eta[1]}:${eta[2]}`, true);
                embed.addField('Calculated Arrival', `${arrival[0]}:${arrival[1]}:${arrival[2]}`, false);

                msg.channel.send(embed);
            } else {
                let embed = new Discord.MessageEmbed();
                embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL());
                embed.setColor(0xff413b);
                embed.setThumbnail(Bot.user.displayAvatarURL());
                embed.setTitle('Arrival Time Calculation');
                embed.setDescription(`How do you use this command:\n\`${config.prefix}time <current-time> eta <eta>\`\nTime Format has to be:\n\`HH:MM:SS\` and in a 24h time format\nJust use ingame time\nExample:\n\`${config.prefix}time 15:12:54 eta 00:54:54\``);

                msg.channel.send(embed);
                msg.delete();
            }
            break;
        case 'starthex':
            if (args != null && args[0] != undefined && args[1] != undefined && args[1] === 'endHex' && args[2] != undefined && args[3] != undefined && args[3] === 'speed' && args[4] != undefined && args[5] != undefined && args[5] === 'time' && args[6] != undefined && args[7] != undefined && args[7] === 'eta' && args[8] != undefined) {

                let eta = args[8].split(':');
                let current_time= args[6].split(':');
                var startHex = args[0].split(',');
                startHex[0] = parseInt(startHex[0],10);
                startHex[1] = parseInt(startHex[1],10);
                var endHex = args[2].split(',');
                endHex[0] = parseInt(endHex[0],10);
                endHex[1] = parseInt(endHex[1],10);
                let speed = parseInt(args[4],10);

                let distance = hexDistance(parseInt(startHex[0]),parseInt(startHex[1]),parseInt(endHex[0]),parseInt(endHex[1]));
                let oneHexTime = 60/(speed/3600);
                var rawTime = (distance*oneHexTime)/60;

                var travel_time = [0,0,0,0];
                while (rawTime > 0) {
                    travel_time[3]++;
                    if (travel_time[3] >= 60) {
                        travel_time[3]=0;
                        travel_time[2]+=1;
                    }
                    if (travel_time[2] >= 60) {
                        travel_time[2]=0;
                        travel_time[1]+=1;
                    }
                    if (travel_time[1] >= 24) {
                        travel_time[1]=0;
                        travel_time[0]+=1;
                    }
                    rawTime--;
                }

                var arrival = [0,0,0,0];
                arrival[0] = parseInt(current_time[0]) + parseInt(eta[0]);
                arrival[1] = parseInt(current_time[1]) + parseInt(eta[1]);
                arrival[2] = parseInt(current_time[2]) + parseInt(eta[2]);
                arrival[3] = parseInt(current_time[3]) + parseInt(eta[3]);

                if (arrival[3] >= 60) {
                    arrival[3] -= 60;
                    arrival[2] += 1;
                }
                if (arrival[2] >= 60) {
                    arrival[2] -= 60;
                    arrival[1] += 1;
                }
                if (arrival[1] >= 24) {
                    arrival[1] -= 24;
                    arrival[0] += 1;
                }

                var timeTillHome = [0,0,0,0];
                timeTillHome[0] = parseInt(eta[0]) + travel_time[0];
                timeTillHome[1] = parseInt(eta[1]) + travel_time[1];
                timeTillHome[2] = parseInt(eta[2]) + travel_time[2];
                timeTillHome[3] = parseInt(eta[3]) + travel_time[3];

                if (timeTillHome[3] >= 60) {
                    timeTillHome[3] -= 60;
                    timeTillHome[2] += 1;
                }
                if (timeTillHome[2] >= 60) {
                    timeTillHome[2] -= 60;
                    timeTillHome[1] += 1;
                }
                if (timeTillHome[1] >= 24) {
                    timeTillHome[1] -= 24;
                    timeTillHome[0] += 1;
                }

                var etaTTH = [0,0,0,0];
                etaTTH[0] = timeTillHome[0] + parseInt(current_time[0]);
                etaTTH[1] = timeTillHome[1] + parseInt(current_time[1]);
                etaTTH[2] = timeTillHome[2] + parseInt(current_time[2]);
                etaTTH[3] = timeTillHome[3] + parseInt(current_time[3]);

                if (etaTTH[3] >= 60) {
                    etaTTH[3] -= 60;
                    etaTTH[2] += 1;
                }
                if (etaTTH[2] >= 60) {
                    etaTTH[2] -= 60;
                    etaTTH[1] += 1;
                }
                if (etaTTH[1] >= 24) {
                    etaTTH[1] -= 24;
                    etaTTH[0] += 1;
                }
                

                if (arrival[0] < 10) arrival[0] = `0${arrival[0]}`;
                if (arrival[1] < 10) arrival[1] = `0${arrival[1]}`;
                if (arrival[2] < 10) arrival[2] = `0${arrival[2]}`;
                if (arrival[3] < 10) arrival[3] = `0${arrival[3]}`;

                if (timeTillHome[0] < 10) timeTillHome[0] = `0${timeTillHome[0]}`;
                if (timeTillHome[1] < 10) timeTillHome[1] = `0${timeTillHome[1]}`;
                if (timeTillHome[2] < 10) timeTillHome[2] = `0${timeTillHome[2]}`;
                if (timeTillHome[3] < 10) timeTillHome[3] = `0${timeTillHome[3]}`;
                
                if (etaTTH[0] < 10) etaTTH[0] = `0${etaTTH[0]}`;
                if (etaTTH[1] < 10) etaTTH[1] = `0${etaTTH[1]}`;
                if (etaTTH[2] < 10) etaTTH[2] = `0${etaTTH[2]}`;
                if (etaTTH[3] < 10) etaTTH[3] = `0${etaTTH[3]}`;

                let embed = new Discord.MessageEmbed();
                embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL());
                embed.setColor(0x5cc3ff);
                embed.setTitle('Arrival Time Calculation');
                embed.setThumbnail(Bot.user.displayAvatarURL());
                embed.addField('Current Time', `${current_time[0]}:${current_time[1]}:${current_time[2]}:${current_time[3]}`, true);
                embed.addField('ETA', `${eta[0]}:${eta[1]}:${eta[2]}:${eta[3]}`, true);
                embed.addField('Calculated Arrival', `${arrival[0]}:${arrival[1]}:${arrival[2]}:${arrival[3]}`, false);
                embed.addField('Start Hex', `${startHex[0]} | ${startHex[1]}`, true);
                embed.addField('End Hex', `${endHex[0]} | ${endHex[1]}`, true);
                embed.addField('Speed', `${speed}`, true);
                embed.addField('ETA Time Until Home', `${timeTillHome[0]}:${timeTillHome[1]}:${timeTillHome[2]}:${timeTillHome[3]}`, false);
                embed.addField('Time of Arrival Home', `${etaTTH[0]}:${etaTTH[1]}:${etaTTH[2]}:${etaTTH[3]}`, false);

                msg.channel.send(embed);
            } else {
                // let embed = new Discord.MessageEmbed();
                // embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL());
                // embed.setColor(0xff413b);
                // embed.setThumbnail(Bot.user.displayAvatarURL());
                // embed.setTitle('Arrival Time Calculation');
                // embed.setDescription(`How do you use this command:\n\`${config.prefix}time <current-time> eta <eta>\`\nTime Format has to be:\n\`HH:MM:SS\` and in a 24h time format\nJust use ingame time\nExample:\n\`${config.prefix}time 15:12:54 eta 00:54:54\``);

                // msg.channel.send(embed);
                // msg.delete();
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