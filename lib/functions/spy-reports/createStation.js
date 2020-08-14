module.exports = {
    name: 'spyCreateStation',
    run: async ({report_string}) => {
        return new Promise((resolve) => {
            if (!(report_string.startsWith('Spy Report on hex') || report_string.startsWith('DEBUG Spy Report on hex'))) resolve(0);
            async function runMe(report_string) {
                try {
                    let station = {};
                    let regex = {};
                    var match;

                    //Station Name
                    station.name = 'N/A';
                    regex.stationName = new RegExp('(?<=\\d\\) )[\\S\\s]*(?= completed)');
                    match = report_string.match(regex.stationName);
                    if (match != null && match[0] != undefined) {
                        let replaceRegex = new RegExp(' ', 'gm');
                        station.name = match[0].replace(replaceRegex, '-');
                    }
            
                    //Description Header
                    station.description = 'N/A';
                    regex.description = new RegExp('(?=Spy Report)[\\n\\s\\S\\r]*(?=\\n\\nCapture Defense:)');
                    match = report_string.match(regex.description);
                    if (match != null && match[0] != undefined) {
                        station.description = match[0];
                    }
            
                    //Hex
                    station.hex = {x: 'N/A', y: 'N/A'}
                    regex.hex = new RegExp('(?<=hex \\()[^\\r\\n\\t\\f\\v]*(?=\\d*\\))');
                    match = report_string.match(regex.hex);
                    if (match != null && match[0] != undefined) {
                        let arr = match[0].split(',');
                        station.hex.x = arr[0];
                        station.hex.y = arr[1];
                    }
            
                    //Capture Defense
                    station.capture_defense = {has: 'N/A', from: 'N/A'};
                    regex.capture_defense = new RegExp('(?<=Capture Defense: )[^\\r\\n\\t\\f\\v]*');
                    match = report_string.match(regex.capture_defense);
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
                    match = report_string.match(regex.resources);
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
                    match = report_string.match(regex.cards);
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
                    match = report_string.match(regex.labor);
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
                    match = report_string.match(regex.buildings_faction);
                    if (match == null || match[0] == undefined) match = report_string.match(regex.buildings_nofaction);
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
                    match = report_string.match(regex.resources_hidden);
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
                    match = report_string.match(regex.outposts);
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
                    regex.fleets_player_names = new RegExp("(?<=From playerProfile\\()[\\S]*(?=\\))", "gm");
                    match = report_string.match(regex.fleets);
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
                    //FLEET PLAYER NAMES
                    match = report_string.match(regex.fleets_player_names);
                    if (await functions.run('spyMatchCheck', {match: match})) {
                        if (match.length == station.fleets.length) {
                            for (var i=0; i<station.fleets.length;i++) {
                                station.fleets[i].player_name = match[i]
                            }
                        }
                    }
            
                    //Hangar
                    station.hangar = ['N/A'];
                    regex.hangar = new RegExp('(?<=Hangar: \\n)[\\s\\S]*');
                    regex.hangar_detail = new RegExp("[A-Za-z\\ '\\(\\)]* \\d*", 'gm');
                    match = report_string.match(regex.hangar);
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
                    match = report_string.match(regex.construction.test);
                    if (await await functions.run('spyMatchCheck', {match: match})) {
                        match = report_string.match(regex.construction.general);
                        if (match != null && match[0] != undefined) {
                            var buildMatch = match[0].match(regex.construction.buildings);
                            var fleetMatch = match[0].match(regex.construction.fleets);
                            if (await buildMatch != null && buildMatch[0] != undefined) {
                                station.construction.buildings = [];
                                var progress = buildMatch[0].match(regex.construction.progress);
                                if (await await functions.run('spyMatchCheck', {match: progress})) {
                                    station.construction.buildprogress = progress[0];
                                    buildMatch[0] = buildMatch[0].replace(progress[0], '');
                                    buildMatch = buildMatch[0].match(regex.construction.building_details);
                                    if (await await functions.run('spyMatchCheck', {match: buildMatch})) {
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
                                if (await await functions.run('spyMatchCheck', {match: progress})) {
                                    station.construction.shipprogress = progress[0];
                                    fleetMatch[0] = fleetMatch[0].replace(progress[0], '')
                                    fleetMatch = fleetMatch[0].match(regex.construction.fleet_details);
                                    if (await await functions.run('spyMatchCheck', {match: fleetMatch})) {
                                        for (var i=0;i<fleetMatch.length;i++) {
                                            let arr = fleetMatch[i].split(' ');
                                            let count = arr.splice(0,1)[0];
                                            if (arr.join(' ').includes('Heavy Scout')) arr = ['Recon'];
                                            if (arr.join(' ').includes('Heavy Scouts')) arr = ['Recons'];
                                            station.construction.ships.push({name: arr.join(' '), count: count});
                                        }
                                    }
                                }
                            }
                        }
                    }
            
                    //GETTING CARD INFORMATIONS
                    if (station.cards != null && station.cards != 'N/A') {
                        for (var i=0; i<station.fleets.length; i++) {
                            if (station.fleets[i].cards != null && station.fleets[i].cards != undefined) {
                                for (var k=0; k<station.fleets[i].cards.length; k++) {
                                    let cardStats = await functions.run('spyGetCardStats', {name: station.fleets[i].cards[k].name});
            
                                    if (cardStats !== -1) {
                                        station.fleets[i].cards[k] = cardStats;
                                    }
                                }
                            }
                        }
                    }
                    
                    //CALCULATIONS
                    station.fleet_fp_base = 'N/A';
                    station.fleet_hp_base = 'N/A';
                    station.fleet_cargo_base = "N/A";
                    station.fleet_bombing_base = "N/A";
                    station.fleet_fp_min = 'N/A';
                    station.fleet_hp_min = 'N/A';
                    station.fleet_cargo_min = "N/A";
                    station.fleet_bombing_min = "N/A";
                    station.fleet_fp_max = 'N/A';
                    station.fleet_hp_max = 'N/A';
                    station.fleet_cargo_max = "N/A";
                    station.fleet_bombing_max = "N/A";
                    station.fleet_labor = "N/A";
                    if (!(station.fleets.length === 0 || station.fleets[0] === 'N/A')) {
                        station.fleet_fp_base = 0;
                        station.fleet_hp_base = 0;
                        station.fleet_cargo_base = 0;
                        station.fleet_bombing_base = 0;
                        station.fleet_fp_min = 0;
                        station.fleet_hp_min = 0;
                        station.fleet_cargo_min = 0;
                        station.fleet_bombing_min = 0;
                        station.fleet_fp_max = 0;
                        station.fleet_hp_max = 0;
                        station.fleet_cargo_max = 0;
                        station.fleet_bombing_max = 0;
                        station.fleet_labor = 0;
                        for (var i=0;i<station.fleets.length;i++) {
                            let temp = await functions.run('spyCalcFleetStats', {fleet: station.fleets[i]});
                            if (temp != 0 && temp != 1) {
                                station.fleets[i].stats = temp;
                                station.fleet_fp_base += parseInt(temp.base_stats.fp, 10);
                                station.fleet_hp_base += parseInt(temp.base_stats.hp, 10);
                                station.fleet_cargo_base += parseInt(temp.base_stats.cargo, 10);
                                station.fleet_bombing_base += parseInt(temp.base_stats.bombing, 10);
                                station.fleet_fp_min += temp.calc_min_stats.fp;
                                station.fleet_hp_min += temp.calc_min_stats.hp;
                                station.fleet_cargo_min += temp.calc_min_stats.cargo;
                                station.fleet_bombing_min += temp.calc_min_stats.bombing;
                                station.fleet_fp_max += temp.calc_max_stats.fp;
                                station.fleet_hp_max += temp.calc_max_stats.hp;
                                station.fleet_cargo_max += temp.calc_max_stats.cargo;
                                station.fleet_bombing_max += temp.calc_max_stats.bombing;
                                station.fleet_labor += parseInt(temp.costs.labor_cost, 10);
                            }
                        }
                    }

                    station.generalised = [];
                    for (var i=0; i<station.fleets.length;i++) {
                        let name = (station.fleets[i].player_name == undefined) ? null:station.fleets[i].player_name;
                        let foundName = -1;
                        for (let j=0; j<station.generalised.length; j++) {
                            if (station.generalised[j].name !== undefined && station.generalised[j].name === name) {
                                foundName = j;
                            }
                        }
                        if (foundName == -1) {
                            station.generalised.push({name: name, ships: [{type: station.fleets[i].type, count: parseInt(station.fleets[i].count, 10)}]});
                        } else {
                            let foundShip = -1;
                            for (let j=0; j<station.generalised[foundName].ships.length; j++) {
                                if (station.generalised[foundName].ships[j].type != undefined && station.generalised[foundName].ships[j].type == station.fleets[i].type) {
                                    foundShip = j;
                                }
                            }
                            if (foundShip == -1) {
                                station.generalised[foundName].ships.push({type: station.fleets[i].type, count: parseInt(station.fleets[i].count, 10)});
                            } else {
                                station.generalised[foundName].ships[foundShip].count += parseInt(station.fleets[i].count, 10);
                            }
                        }
                    }
                    
            
                    if (report_string.startsWith('DEBUG')) {
                        console.log(station);
                    }
            
                    return station;
                }
                catch (err) {
                    console.log(err);
                    return 0;
                }
                return 0;
            }
            resolve(runMe(report_string))
        })
    }
}