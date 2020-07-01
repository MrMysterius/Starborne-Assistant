const Discord = require('discord.js');
const https = require('https');
const fs = require('fs');

function download(url, msg, cb) {
    try {
        let rdm = Math.floor(Math.random() * 1000000000);
        let path = `./downloads/${rdm}.txt`
        var file = fs.createWriteStream(path, 'utf-8');
        var req = https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                let read = fs.readFileSync(path.toString(), 'utf-8');
                fs.unlink(path, ()=>{});
                let regex = new RegExp('\\r','g');
                read = read.replace(regex, '');
                cb(read, msg);
                return;
            })
        })
    }
    catch (error) {
        console.log(error);
    }
}

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
            if (msg.author.bot) return;

            if (msg.channel.name != undefined && (msg.channel.name.includes('spy-data') || msg.channel.name.includes('spy-report')) || msg.channel.type == 'dm') {
                if (msg.content.startsWith('Spy Report on hex')) {
                    try {
                        var station = lib.fnc.getStationInformation(msg.content);
        
                        if (station != 'error') {
                            msg.delete();
                            let embed = lib.fnc.createReportEmbed(station, msg, this.client);
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

                let attach = msg.attachments.array()[0]
                if (attach != undefined && attach.name == 'message.txt' && attach.size < 100000) {
                    download(attach.url, msg, (text, mobj) => {
                        if (!text.startsWith('Spy Report on hex')) return;
                        try {
                            var station = lib.fnc.getStationInformation(text);

                            if (station != 'error') {
                                let embed = lib.fnc.createReportEmbed(station, mobj, this.client);
                                try {
                                    if (mobj.deletable) {
                                        mobj.delete();
                                    }
                                    mobj.channel.send(embed);
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
                    });
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
                        console.log(`[- | CODE] ${reports[i].code}`);
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

        this.guild_count = 0;

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
                this.guild_count = counter;
            },60000);
        })

        this.config = config;
        this.client.login(token);
    }
}

module.exports = DiscordBot;