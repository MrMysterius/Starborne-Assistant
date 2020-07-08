const Discord = require('discord.js');
const https = require('https');
const fs = require('fs');
const database = require('./database');

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
        this.client = new Discord.Client(); //New Discord Client

        //ADDED TO GUILD
        this.client.on('guildCreate', (guild) => {
            console.log(`[+ | GUILD] ${guild.name} | ${guild.owner.user.tag}`); //CONSOLE LOG
            db.add('servers', 'insert', {server_id: guild.id}); //DATABASE ENTRY INSERTION
        })

        //REMOVED FROM GUILD
        this.client.on('guildDelete', (guild) => {
            console.log(`[- | GUILD] ${guild.name} | ${guild.owner.user.tag}`); //CONSOLE LOG
            db.add('servers', 'delete', {server_id: guild.id}); //DATABASE ENTRY DELETION
        })

        this.client.on('message', (msg) => {
            if (msg.author.bot) return; //RETURNING IF AUTHOR IS A BOT

            //EXECUTING DIFFRENTLY AFTER CHANNEL TYPE
            switch (msg.channel.type) {
                case 'text':
                    try {
                        //Checking if channel settings exist
                        db.channel_settings(msg.guild.id, msg.channel.id).then((row) => {
                            var station = 'error';

                            //CHECKING IF ITS A SPY REPORT
                            if (msg.content.startsWith('Spy Report on hex')) {
                                station = lib.fnc.getStationInformation(msg.content); //Getting Station Info
                            }

                            if (row != 'error' && station != 'error') {
                                switch (row.auto_category_enabled) {
                                    case 1:
                                        var found = false;
                                        this.client.guilds.cache.get(msg.guild.id).channels.cache.forEach((channel) => {
                                            if (channel.id == row.category_id && channel.type == 'category') found = true;
                                        })
                                        if (found) {

                                        } else {
                                            msg.guild.channels.create('Spy Reports', {type: 'category'}).then((category) => {
                                                db.do('channel_settings', 'update', {
                                                    server_id: row.server_id, 
                                                    channel_id: row.channel_id, 
                                                    starborne_server: row.starborne_server,
                                                    auto_category_enabled: row.auto_category_enabled,
                                                    category_id: category.id,
                                                    deletion_timeout: row.deletion_timeout
                                                });
                                                
                                                
                                            });
                                        }

                                        break;
                                    case 0:
                                        let embed = lib.fnc.createReportEmbed(station, msg, this.client);
                                        try {
                                            msg.channel.send(embed);
                                            if (msg.deletable) {
                                                msg.delete();
                                            }
                                        }
                                        catch (err) {
                                            console.log(err);
                                            console.log(station);
                                        }
                                        break
                                }
                            } else if (msg.channel.name != undefined && (msg.channel.name.includes('spy-data') || msg.channel.name.includes('spy-report')) && station != 'error') {
                                let embed = lib.fnc.createReportEmbed(station, msg, this.client);
                                try {
                                    msg.channel.send(embed);
                                    if (msg.deletable) {
                                        msg.delete();
                                    }
                                }
                                catch (err) {
                                    console.log(err);
                                    console.log(station);
                                }
                            }
                        })
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case 'dm':
                    break;
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