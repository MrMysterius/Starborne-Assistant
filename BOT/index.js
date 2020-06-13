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
                    let embed = lib.fnc.createReportEmbed(station, msg);
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
                    let embed = lib.fnc.createReportEmbed(reports[i].data, msg);
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

    lib.cmd.run(command, args, msg);
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