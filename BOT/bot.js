const Discord = require('discord.js');

class DiscordBot {
    constructor (token, config) {
        this.client = new Discord.Client();

        //ADDED TO GUILD
        this.client.on('guildCreate', (guild) => {
            var tabs = '';
            for (var i=0; i<Math.floor(guild.name.length+12/8); i++) {
                tabs += '\t'
            }
            console.log(`[+ | GUILD] ${guild.name}${tabs}${guild.owner.user.tag}`);
        })

        //REMOVED FROM GUILD
        this.client.on('guildDelete', (guild) => {
            var tabs = '';
            for (var i=0; i<Math.floor(guild.name.length+12/8); i++) {
                tabs += '\t'
            }
            console.log(`[- | GUILD] ${guild.name}${tabs}${guild.owner.user.tag}`);
        })

        this.client.on('message', (msg) => {
            if (msg.author.bot || msg.channel.name == undefined) return;

            if (msg.channel.name.includes('spy-data') || msg.channel.name.includes('spy-report')) {
                if (msg.content.startsWith('Spy Report on hex')) {
                    try {
                        
                        var station = lib.fnc.getStationInformation(msg.content);
        
                        if (station != 'error') {
                            msg.delete();
                            let embed = lib.fnc.createReportEmbed(station, msg, this.client, this.client);
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
                            let embed = lib.fnc.createReportEmbed(reports[i].data, msg, this.client);
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
        
            lib.cmd(command, args, msg, this.client);
        })

        //WHEN CLIENT IS READY DISPLAY ALL GUILDS THE BOT IS ON AND ALSO MAKE A INTERVAL TO DISPLAY ACTIVITY INFO
        this.activityInterval = -1;     //INTERVAL ID TO CLEAR IT IF READY CALLED AGAIN AFTER RECONNECT
        this.client.on('ready', () => {
            //CONSOLE OUTPUT OF ALL GUILDS THE BOT IS ON
            console.log(`BOT CONNECTED TO...`);
            this.client.guilds.cache.forEach((guild) => {
                console.log(`> ${guild.name} | ${guild.owner.user.username}#${guild.owner.user.discriminator}`);
            })

            //SETTING THE BOOT UP ACTIVITY SO PEOPLE KNOW THE BOT IS STARTING
            this.client.user.setPresence({activity: {name: "BOOTING UP | CONNECTING"}, status: "idle"});
            //CLEARING / STOPING OLD INTERVAL
            if (this.activityInterval != -1) {
                clearInterval(this.activityInterval)
            }
            //STARTING NEW INTERVAL
            this.activityInterval = setInterval(()=>{
                var counter = 0;
                this.client.guilds.cache.forEach((guild) => {
                    counter++;
                })
                this.client.user.setPresence({activity: {name: `${config.prefix}help | ${counter} Guilds`}, status: "online"});
            },60000);
        })

        this.client.login(token);
    }
}

module.exports = DiscordBot;