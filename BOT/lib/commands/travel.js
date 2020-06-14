const Discord = require('discord.js');

function run(Bot, args, msg) {
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
        distance = lib.fnc.hexDistance(sHex[0],sHex[1],eHex[0],eHex[1]);
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

    var dayString = `${(pHome[0] <10)?'0'+pHome[0]:pHome[0]}:`;
    switch (pHome[0]) {
        case 0:
            dayString = 'Today at ';
            break;
        case 1:
            dayString = 'Tomorrow at ';
            break;
        default:
            if (pHome[0]>1) {
                dayString = `In ${pHome[0]-1} Days at `
            }
            break;
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
        embed.addField(':outbox_tray: Back Home', `${dayString}${(pHome[1] <10)?'0'+pHome[1]:pHome[1]}:${(pHome[2] <10)?'0'+pHome[2]:pHome[2]}:${(pHome[3] <10)?'0'+pHome[3]:pHome[3]}.${(pHome[4] <10)?'00'+pHome[4]:(pHome[4] <100)?'0'+pHome[4]:pHome[4]}`, false);
    } else if (time != -1) {
        embed.addField(':clock10: Current Time', `${(cTime[0] <10)?'0'+cTime[0]:cTime[0]}:${(cTime[1] <10)?'0'+cTime[1]:cTime[1]}:${(cTime[2] <10)?'0'+cTime[2]:cTime[2]}`, false);
        embed.addField(':inbox_tray: ETA', `${(pTime[0] <10)?'0'+pTime[0]:pTime[0]}:${(pTime[1] <10)?'0'+pTime[1]:pTime[1]}:${(pTime[2] <10)?'0'+pTime[2]:pTime[2]}:${(pTime[3] <10)?'0'+pTime[3]:pTime[3]}.${(pTime[4] <10)?'0'+pTime[4]:pTime[4]}`, false);
        embed.addField(':outbox_tray: Back Home', `${dayString}${(pHome[1] <10)?'0'+pHome[1]:pHome[1]}:${(pHome[2] <10)?'0'+pHome[2]:pHome[2]}:${(pHome[3] <10)?'0'+pHome[3]:pHome[3]}.${(pHome[4] <10)?'00'+pHome[4]:(pHome[4] <100)?'0'+pHome[4]:pHome[4]}`, false);
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
}

module.exports = run;