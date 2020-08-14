const PATH = require('path');
const FS = require('fs');

const runNow = (commandToRunObject, data) => {
    try {
        commandToRunObject.run(data);
        return 1;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

const checkFiles = (files, commandsDirPath) => {
    let list = [];
    files.forEach((file) => {
        let filePath = PATH.join(commandsDirPath, file);
        let stats = FS.lstatSync(filePath);
        if ((stats.isDirectory() && file != 'config' || stats.isFile() && file.endsWith('.js')) && !file.startsWith('--')) {
            list.push({path: filePath});
            console.log(`\t\t\t- ${file}`);
        }
    })
    return list;
}

const getPath = ({path, type}) => {
    switch (type) {
        case 'absolute':
            return PATH.normalize(path);
            break;
        case 'relative':
            return PATH.join(process.cwd(), path);
            break;
    }
    return undefined;
}

module.exports = class CommandsHandler {
    constructor (config) {
        this.commands = [];

        console.log(`[COMMANDS|LOADING]\tBeginning...`);
        for (var i=0;i<config.length;i++) {
            let commandsDirPath = getPath(config[i]);
            if (commandsDirPath != undefined) {
                console.log(`[COMMANDS|LOADING]\tReading directory ${commandsDirPath}...`);
                try {
                    console.log(`[COMMANDS|LOADING]\tRequiring files/directorys in ${commandsDirPath}...`);
                    checkFiles(FS.readdirSync(commandsDirPath), commandsDirPath).forEach(({path}) => {
                        try {
                            let temp = require(path);
                            if (temp.name == undefined || temp.version == undefined || temp.command == undefined || temp.aliases == undefined) throw new Error("This is not viable command file");
                            this.commands.push(temp);
                            console.log(`\t\t\t+ ${temp.name}^${temp.version} - ${path}`);
                        }
                        catch (err) {
                            console.log(`[COMMANDS|ERROR]\tCouldn't require ${path}\n\n${err}\n`);
                        }
                    });
                }
                catch (err) {
                    console.log(`[COMMANDS|ERROR]\tReading directory ${commandsDirPath}\n\n${err}\n`);
                }
            }
        }
        console.log(`[COMMANDS|LOADED]\tCompleted!`);
    }

    run (commandToRun, data) {
        for(let entryID=0;entryID<this.commands.length;entryID++) {
            if (this.commands[entryID].command == commandToRun) return runNow(this.commands[entryID], data);
            for (let i=0;i<this.commands[entryID].aliases.length;i++) {
                if (this.commands[entryID].aliases[i] == commandToRun) return runNow(this.commands[entryID], data);
            }
        }
        return 0;
    }
}