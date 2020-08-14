const { arch } = require('os');

module.exports = {
    name: 'Print Servers',
    version: '1.0',
    command: 'printServers',
    aliases: ['print'],
    run: async ({command, args, msg}) => {
        if (msg.author.id != 137547836609789952) return;
        const fs = require('fs');
        const path = require('path');
        let filePath = path.join(process.cwd(), `/logs/${args[0]}-print.md`);
        fs.appendFileSync(filePath, `Index|Guild ID|Guild Name|Owner ID|Owner Name|Permissions\n`)
        fs.appendFileSync(filePath, `-----|--------|----------|--------|----------|-----------\n`)
        let counter = 0;
        bot.client.guilds.cache.forEach((guild) => {
            let permString = '';
            let obj = guild.me.permissions.serialize();
            for (let key in guild.me.permissions.serialize()) {
                if (obj[key]) permString += (key=='ADMINISTRATOR'||key=='MANAGE_SERVER'||key=='MANAGE_CHANNELS'||key=='KICK_MEMBERS'||key=='BAN_MEMBERS'||key=='MANAGE_ROLES'||key=='MANAGE_MESSAGES')? `**${key}** `:`${key} `;
            }
            fs.appendFileSync(filePath, `${counter} | ${guild.id} | ${guild.name} | ${guild.ownerID} | ${guild.owner.user.tag} | ${permString}\n`);
            counter++
        })

        msg.channel.send({
            embed: {
                title: 'Servers Print in Markdown',
                color: 0xDDDDDD
            },
            files: [{
                attachment: filePath,
                name: `${args[0]}.md`
            }],
        }).then((message) => {
            if (msg.deletable) msg.delete();
            if (message.deletable) message.delete({timeout: 30000});
            fs.unlinkSync(filePath);
        })
    }
}