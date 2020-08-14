module.exports = {
    name: 'ping',
    version: '1.0',
    command: 'ping',
    aliases: ['beep'],
    run: async ({msg, command, args}) => {
        switch (command) {
            case 'ping':
                msg.reply('Ping!');
                break;
            case 'beep':
                msg.reply('Boop!');
                break;
        }
    }
}